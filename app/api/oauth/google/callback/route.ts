import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=missing_code`
      );
    }

    const { agent_id } = JSON.parse(decodeURIComponent(state));

    // EXCHANGE CODE FOR TOKENS
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
    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=token_failed`
      );
    }

    const { access_token, refresh_token, scope, token_type, expires_in } = tokens;

    // GET EMAIL FROM GOOGLE
    const profileRes = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const profile = await profileRes.json();
    const email = profile.emailAddress;

    // REMOVE OLD CREDENTIALS TO PREVENT CONFLICTS
    await supabase
      .from("client_credentials")
      .delete()
      .eq("agent_id", agent_id)
      .eq("provider", "google");

    // 🔥 UPSERT WORKING FIX
    const { error: insertError } = await supabase
      .from("client_credentials")
      .upsert(
        {
          agent_id,
          provider: "google",
          access_token,
          refresh_token,
          scope,
          token_type,
          email_connected: email,
          expiry_timestamp: new Date(Date.now() + expires_in * 1000).toISOString(),
        },
        {
          onConflict: ["agent_id", "provider"], // <--- KĽÚČOVÉ
          ignoreDuplicates: false,
        }
      );

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=db_error`
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?statu_
