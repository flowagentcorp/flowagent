import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')

    if (!code) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_code`)

    // 🔥 získame usera priamo cez Supabase Auth
    const { data: tokenData, error: tokenError } = await supabase.auth.exchangeCodeForSession(code)
    if (tokenError) throw tokenError

    const agent_id = tokenData.user.id

    // 🔥 Získame gmail profile + OAuth tokeny
    const { access_token, refresh_token, expires_in, scope, token_type } = tokenData.session.provider_token!!

    const profileRes = await fetch("https://www.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${access_token}` }
    })

    const profile = await profileRes.json()
    const email = profile.emailAddress

    // 🔥 Uloženie credov (automatický override)
    const { error } = await supabase
      .from("client_credentials")
      .upsert({
        agent_id,
        provider: "google",
        access_token,
        refresh_token,
        scope,
        token_type,
        email_connected: email,
        expiry_timestamp: new Date(Date.now() + expires_in * 1000).toISOString(),
      }, { onConflict: "agent_id,provider" })

    if (error) throw error

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?gmail=linked`)
  }
  catch(err){
    console.error(err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=oauth_fail`)
  }
}
