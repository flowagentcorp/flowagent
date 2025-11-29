import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const supabase = await createServerSupabaseClient()
  
  // Exchange code for session
  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('OAuth exchange error:', error)
    return NextResponse.redirect(new URL('/login?error=oauth', request.url))
  }

  // CRITICAL: Check if agent exists, if not create one
  if (user) {
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!existingAgent) {
      // Agent doesn't exist, create one
      const { error: createError } = await supabase
        .from('agents')
        .insert({
          auth_user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email || 'User',
          email: user.email || '',
        })

      if (createError) {
        console.error('Failed to create agent:', createError)
        // Try to continue anyway, maybe the trigger will handle it
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
