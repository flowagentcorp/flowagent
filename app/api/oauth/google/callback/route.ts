import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")

    if (!code || !state)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=missing_code`)

    const { agent_id } = JSON.parse(decodeURIComponent(state))

    const tokenRequest = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code"
      })
    })

    const tokens = await tokenRequest.json()
    if (!tokens.access_token)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=token_issue`)

    // Fetch profile email
    const profileReq = await fetch("https://www.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })
    const profile = await profileReq.json()

    // Delete old provider creds
    await supabase.from("client_credentials").delete().eq("agent_id", agent_id).eq("provider", "google")

    const { error } = await supabase.from("client_credentials").insert({
      agent_id,
      provider: "google",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      email_connected: profile.emailAddress,
      expiry_timestamp: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    })

    if (error) throw error

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?status=connected`)
  } catch (e) {
    console.error("Google OAuth callback error:", e)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/connect/google?error=callback_crash`)
  }
}
