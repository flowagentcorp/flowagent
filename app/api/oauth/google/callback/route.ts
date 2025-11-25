import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function makeUUID() {
  try {
    // @ts-ignore
    return (globalThis as any).crypto?.randomUUID?.() ?? require("crypto").randomUUID();
  } catch {
    return require("crypto").randomUUID();
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=no_code`
      );
    }

    // 1) TOKEN EXCHANGE
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
      console.error("Token error:", tokens);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=token`
      );
    }

    const { access_token, refresh_token, scope, token_type, expires_in } = tokens;

    // 2) GET PROFILE → GET EMAIL
    const profileRes = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const profile = await profileRes.json();
    if (!profileRes.ok) {
      console.error("Profile error:", profile);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=profile`
      );
    }

    const email = profile.emailAddress;

    // 3) CHECK IF EMAIL ALREADY EXISTS
    const { data: existing } = await supabase
      .from("client_credentials")
      .select("agent_id")
      .eq("email_connected", email)
      .maybeSingle();

    let agent_id = existing?.agent_id ?? makeUUID();

    // 4) UPSERT (email je UNIQUE — takže každý email = jedna identita)
    const row = {
      id: makeUUID(),
      agent_id,
      provider: "google",
      access_token,
      refresh_token,
      scope,
      token_type,
      email_connected: email,
      expiry_timestamp: new Date(Date.now() + expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from("client_credentials")
      .upsert(row, { onConflict: "email_connected" });

    if (upsertErr) {
      console.error("Supabase error:", upsertErr);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=supabase`
      );
    }

    // 5) SET SESSION
    const res = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?status=connected`
    );

    const session = await getSession(req, res);
    session.user = { agent_id, email };
    await session.save();

    return res;
  } catch (err) {
    console.error("Callback exception:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=exception`
    );
  }
}
