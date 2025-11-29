import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(new URL('/login?error=oauth', request.url))
    }

    // The trigger should handle agent creation, but let's give it time
    await new Promise(resolve => setTimeout(resolve, 100))

    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (err) {
    console.error('Callback error:', err)
    return NextResponse.redirect(new URL('/login?error=server', request.url))
  }
}
