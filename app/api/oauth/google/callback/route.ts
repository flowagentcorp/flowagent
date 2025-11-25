import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");

    if (!state || !code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=no_code`
      );
    }

    const { agent_id } = JSON.parse(decodeURIComponent(state));

    // 1️⃣ EXCHANGE AUTHORIZATION CODE → TOKENS
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    const { access_token, refresh_token, scope, token_type, expires_in } = tokens;

    // 2️⃣ GET USER EMAIL
    const profileRes = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const profile = await profileRes.json();
    const email = profile.emailAddress;

    // 3️⃣ INSERT — NEW ROW FOR EACH CONNECTED EMAIL
    const { error } = await supabase.from("client_credentials").insert({
      id: crypto.randomUUID(),       // PK UUID
      agent_id,                       // your agent
      provider: "google",
      access_token,
      refresh_token,
      scope,
      token_type,
      email_connected: email,
      expiry_timestamp: new Date(Date.now() + expires_in * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=supabase`
      );
    }

    // 4️⃣ START GMAIL WATCH() FOR THIS USER
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/watch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id }),
    }).catch((err) => console.error("Watch error:", err));

    // 5️⃣ SET SESSION + REDIRECT
    const res = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?status=connected`
    );

    const session = await getSession(req, res);
    session.user = { agent_id, email };
    await session.save();

    return res;

  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=exception`
    );
  }
}
