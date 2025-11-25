// app/api/oauth/google/callback/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";

// Generate UUID
function makeUUID() {
  try {
    return (globalThis as any).crypto?.randomUUID?.() ?? require("crypto").randomUUID();
  } catch {
    return require("crypto").randomUUID();
  }
}

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

    // agent_id zo state
    const parsed = JSON.parse(decodeURIComponent(state));
    const agent_id = parsed?.agent_id ?? makeUUID();

    // Exchange code → tokens
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
    if (!tokenRes.ok) {
      console.error("Token exchange error:", tokens);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=token_exchange`
      );
    }

    const { access_token, refresh_token, scope, token_type, expires_in } = tokens;

    // Získaj email profilu
    const profileRes = await fetch("https://www.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = await profileRes.json();
    if (!profileRes.ok) {
      console.error("Profile error:", profile);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=profile_fetch`
      );
    }

    const email = profile.emailAddress;

    // ---- INSERT NEW ROW ----
    const row = {
      id: makeUUID(),          // always unique
      agent_id,                // each user = new row
      provider: "google",
      access_token,
      refresh_token,
      scope,
      token_type,
      email_connected: email,
      expiry_timestamp: new Date(Date.now() + (expires_in ?? 3600) * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("client_credentials")
      .insert(row);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=supabase_insert`
      );
    }

    // Spusti Gmail watch
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/watch?agent_id=${encodeURIComponent(agent_id)}`,
      { method: "POST" }
    ).catch(() => {});

    // Session
    const res = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?status=connected`
    );

    const session = await getSession(req, res);
    session.user = { agent_id, email };
    await session.save();

    return res;

  } catch (err: any) {
    console.error("Callback exception:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=exception`
    );
  }
}
