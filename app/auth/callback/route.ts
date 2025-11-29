import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
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

  // Use service role client to bypass RLS
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (user) {
    // Check if agent exists
    const { data: existingAgent } = await serviceClient
      .from('agents')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    // If no agent, create one
    if (!existingAgent) {
      const { error: createError } = await serviceClient
        .from('agents')
        .insert({
          auth_user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email || 'User',
          email: user.email || '',
        })

      if (createError) {
        console.error('Failed to create agent:', createError)
        return NextResponse.redirect(new URL('/login?error=db_error', request.url))
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
