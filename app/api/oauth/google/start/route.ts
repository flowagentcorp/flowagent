import { NextResponse } from "next/server";

// vygenerujeme agent_id ak nie je poslaný (model 1)
export async function GET(req: Request) {
  const url = new URL(req.url);
  // môžeš poslať volunteerne ?agent_id=... ak chceš re-use
  let agent_id = url.searchParams.get("agent_id");
  if (!agent_id) {
    // modernny Node: crypto.randomUUID()
    agent_id = (globalThis as any).crypto?.randomUUID?.() || 
               require("crypto").randomUUID();
  }

  const state = encodeURIComponent(JSON.stringify({ agent_id }));

  const oauthUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.labels"
      ].join(" "),
      state,
    }).toString();

  return NextResponse.redirect(oauthUrl);
}
