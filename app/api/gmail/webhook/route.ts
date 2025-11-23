import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const agent_id = body.agent_id;
    const messageId = body.messageId;

    if (!agent_id || !messageId) {
      return NextResponse.json(
        { error: "agent_id and messageId required" },
        { status: 400 }
      );
    }

    // Forward to fetch-message route
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/fetch-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id, messageId }),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Webhook failed" },
      { status: 500 }
    );
  }
}
