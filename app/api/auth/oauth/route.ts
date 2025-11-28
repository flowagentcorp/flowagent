import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider') || 'google'
  const supabase = await createServerSupabaseClient()
  const redirectTo = `${request.nextUrl.origin}/api/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'azure' | 'apple' | 'bitbucket' | 'discord' | 'facebook' | 'figma' | 'github' | 'gitlab' | 'kakao' | 'keycloak' | 'linkedin' | 'linkedin_oidc' | 'notion' | 'slack' | 'spotify' | 'twitch' | 'twitter' | 'workos' | 'zoom',
    options: { redirectTo },
  })

  if (error || !data?.url) {
    return NextResponse.json({ error: error?.message ?? 'OAuth error' }, { status: 400 })
  }

  return NextResponse.redirect(data.url)
}
