import { createServerSupabaseClient } from '@/lib/supabase/server'
import { type Provider } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const providerParam = request.nextUrl.searchParams.get('provider') ?? 'google'
  const allowedProviders: Provider[] = ['google']
  const provider = allowedProviders.includes(providerParam as Provider)
    ? (providerParam as Provider)
    : 'google'
  const supabase = await createServerSupabaseClient()
  const redirectTo = `${request.nextUrl.origin}/api/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  })

  if (error || !data?.url) {
    return NextResponse.json({ error: error?.message ?? 'OAuth error' }, { status: 400 })
  }

  return NextResponse.redirect(data.url)
}
