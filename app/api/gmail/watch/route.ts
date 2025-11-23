import { NextResponse } from "next/server";

// --- HELPER: spúšťame POST logiku aj cez GET pri testovaní ---
export async function GET(req: Request) {
  return POST(req);
}

// --- REAL POST LOGIKA PRE GMAIL WATCH ---
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

    console.log("🔔 Gmail WATCH triggered for agent:", agent_id);
    console.log("🔍 Env:", {
      GMAIL_WATCH_TOPIC: process.env.GMAIL_WATCH_TOPIC,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "OK" : "MISSING",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "OK" : "MISSING",
      SUPABASE_URL: process.env.SUPABASE_URL ? "OK" : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING"
    });

    if (!process.env.GMAIL_WATCH_TOPIC) {
      return NextResponse.json(
        { error: "Missing GMAIL_WATCH_TOPIC in env" },
        { status: 500 }
      );
    }

    // Volanie na Gmail watch endpoint
    const watchRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/watch",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
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
      console.error("❌ Gmail watch failed:", watchData);
      return NextResponse.json(
        { error: "Gmail watch failed", details: watchData },
        { status: 500 }
      );
    }

    console.log("✅ Gmail watch set:", watchData);

    return NextResponse.json({
      success: true,
      message: "Gmail watch successfully registered",
      watchData,
    });
  } catch (err: any) {
    console.error("❌ Watch unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error", details: err.message },
      { status: 500 }
    );
  }
}
