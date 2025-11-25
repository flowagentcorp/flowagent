import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // vždy vygenerovať nový agent_id pre každeho klienta
  const agent_id = crypto.randomUUID();

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
