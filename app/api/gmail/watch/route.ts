import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agent_id = searchParams.get("agent_id");

    if (!agent_id) {
      return NextResponse.json(
        { error: "Missing agent_id" },
        { status: 400 }
      );
    }

    // 1️⃣ ZÍSKAJ TOKENY AGENTA
    const { data, error } = await supabase
      .from("client_credentials")
      .select("*")
      .eq("agent_id", agent_id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: "No credentials found for agent" },
        { status: 404 }
      );
    }

    let access_token = data.access_token;

    // 2️⃣ AK EXPIROVANÝ → REFRESH TOKEN
    if (new Date(data.expiry_timestamp) < new Date()) {
      const refresh = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: data.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      const newTokens = await refresh.json();

      access_token = newTokens.access_token;

      // Ulož nový access token
      await supabase
        .from("client_credentials")
        .update({
          access_token,
          expiry_timestamp: new Date(
            Date.now() + newTokens.expires_in * 1000
          ).toISOString(),
        })
        .eq("agent_id", agent_id);
    }

    // 3️⃣ VOLANIE GMAIL WATCH S REÁLNYM ACCESS TOKENOM
    const watchRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/watch",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topicName: process.env.GMAIL_WATCH_TOPIC,
          labelIds: ["INBOX"],
        }),
      }
    );

    const watchData = await watchRes.json();

    if (!watchRes.ok) {
      return NextResponse.json(
        { error: "Gmail watch failed", details: watchData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      watchData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected server error", details: err.message },
      { status: 500 }
    );
  }
}
