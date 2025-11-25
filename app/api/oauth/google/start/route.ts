import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const res = new NextResponse();
  const session = await getSession(req, res);

  // agent_id musí byť uložený v session (toto je unikátna identita užívateľa)
  const agent_id = session.user?.agent_id;

  if (!agent_id) {
    return NextResponse.json(
      { error: "Missing agent_id. User must be logged in." },
      { status: 400 }
    );
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
