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

    // 🔥 Exchange code for tokens
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

    // 🔥 Fetch Gmail account email
    const profileRes = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const profile = await profileRes.json();
    const email = profile.emailAddress;

    // 🔥 Delete old auth rows (avoids unique violation)
    await supabase.from("client_credentials")
      .delete()
      .eq("agent_id", agent_id)
      .eq("provider", "google");

    // 🔥 Supabase UPSERT — correct TypeScript + DB compatible
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
        } as any,          // <<< ⛔ FIXES BUILD ERROR
        { onConflict: "agent_id,provider" } // <<< STRING, nie array
      );

    if (insertError) {
      console.log(insertError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=db_error`
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?status=connected`
    );

  } catch (err) {
    console.error(err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=exception`
    );
  }
}
