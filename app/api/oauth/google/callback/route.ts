// app/api/oauth/google/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";

// Safe crypto UUID: globalThis.crypto v Node 18+, fallback na require("crypto")
function makeUUID() {
  try {
    // @ts-ignore
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

    console.log("[callback] start", { stateExists: !!state, codeExists: !!code });

    if (!state || !code) {
      console.warn("[callback] missing state or code");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=no_code`
      );
    }

    const parsed = JSON.parse(decodeURIComponent(state));
    const agent_id = parsed?.agent_id ?? makeUUID();
    console.log("[callback] agent_id:", agent_id);

    // Exchange auth code for tokens
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
      console.error("[callback] token exchange failed", tokens);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=token_exchange`
      );
    }
    const { access_token, refresh_token, scope, token_type, expires_in } = tokens;
    console.log("[callback] tokens OK", { hasAccess: !!access_token, hasRefresh: !!refresh_token });

    // Get Gmail profile (email)
    const profileRes = await fetch("https://www.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const profile = await profileRes.json();
    if (!profileRes.ok) {
      console.error("[callback] profile fetch failed", profile);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=profile_fetch`
      );
    }
    const email = profile.emailAddress;
    console.log("[callback] profile email:", email);

    // Insert a new row (SaaS mode)
    const row = {
      id: makeUUID(),
      agent_id,
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

    const { error: insertError } = await supabase.from("client_credentials").insert(row);
    if (insertError) {
      console.error("[callback] supabase insert error:", insertError);
      // If RLS/policies block insert, return an error redirect for easier debugging
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=supabase_insert`
      );
    }
    console.log("[callback] supabase insert ok, id:", row.id);

    // Trigger gmail/watch for this agent
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/watch?agent_id=${encodeURIComponent(agent_id)}`, {
        method: "POST",
      });
    } catch (watchErr) {
      console.warn("[callback] watch trigger failed (nonfatal):", watchErr);
    }

    // Set session
    const res = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?status=connected`
    );
    const session = await getSession(req, res);
    session.user = { agent_id, email };
    await session.save();

    return res;
  } catch (err: any) {
    console.error("[callback] unexpected error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=exception`
    );
  }
}
