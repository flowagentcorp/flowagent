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

    // Exchange authorization_code for access + refresh tokens
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

    // Get Gmail profile
    const profileRes = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    const profile = await profileRes.json();
    const email = profile.emailAddress;

    // Save credentials in Supabase
    const { error } = await supabase.from("client_credentials").upsert(
      {
        agent_id,
        provider: "google",
        access_token,
        refresh_token,
        scope,
        token_type,
        email_connected: email,
        expiry_timestamp: new Date(
          Date.now() + expires_in * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "agent_id" }
    );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=supabase`
      );
    }

    // 🍀 AFTER SAVING TOKENS → RUN Gmail WATCH()
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/watch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id }),
    }).catch((err) => console.error("Watch error:", err));

    // Create session
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
