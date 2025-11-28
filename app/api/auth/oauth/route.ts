import { createServerSupabaseClient } from '@/lib/supabase/server'
import { type Provider } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const allowedProviders = ['google'] as const

type AllowedProvider = (typeof allowedProviders)[number]

function resolveProvider(providerParam: string | null): Provider {
  const provider = providerParam ?? 'google'
  return allowedProviders.includes(provider as AllowedProvider)
    ? (provider as AllowedProvider)
    : 'google'
}

export async function GET(request: NextRequest) {
  const provider = resolveProvider(request.nextUrl.searchParams.get('provider'))
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
