import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("BODY FROM N8N:", body);

    const agent_id = body.agent_id;
    const email = body.email;

    if (!agent_id || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // write access
    );

    //
    // 1) INSERT LEAD — FIX: source = "email"
    //
    const { data: leadRow, error: leadErr } = await supabase
      .from("leads")
      .insert({
        agent_id: agent_id,
        name: email.from_name || "",
        email: email.from_email,
        phone: email.phone || null,
        location: email.location || null,
        budget: email.budget || null,
        property_type: email.property_type || "unknown",
        bedrooms: email.bedrooms || null,
        bathrooms: email.bathrooms || null,
        timeline: email.timeline || "unknown",
        message: email.body_plain?.substring(0, 500) || "",
        source: "email",                 // 🔥 FIX - constraint check passes
        status: "new",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (leadErr) {
      console.error("Lead insert error:", leadErr);
      return NextResponse.json({ error: "Lead insert failed" }, { status: 500 });
    }

    //
    // 2) INSERT MESSAGE
    //
    await supabase.from("messages").insert({
      lead_id: leadRow.id,
      agent_id: agent_id,
      message_type: "email_inbound",
      direction: "inbound",
      subject: email.subject || null,
      content: email.body_plain || "",
      status: "received",
      external_message_id: email.external_message_id || null,
      source: "email",               // 🔥 FIX
      created_at: email.received_at || new Date().toISOString(),
    });

    //
    // 3) TRIGGER SCORING PIPELINE (MODULE 2)
    //
    if (process.env.WEBHOOK_URL) {
      await fetch(`${process.env.WEBHOOK_URL}/lead-created`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadRow.id, agent_id }),
      });
    }

    return NextResponse.json({ success: true, lead_id: leadRow.id });
  } catch (err) {
    console.error("INTAKE ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
