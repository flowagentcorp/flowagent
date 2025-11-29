import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { user: null, error: error?.message || 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get the agent profile for this user
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (agentError) {
      console.error('Agent query error:', agentError)
      return NextResponse.json(
        {
          user,
          agent: null,
          error: 'Agent profile not found. Please contact support.'
        },
        { status: 404 }
      )
    }

    // If no agent exists, try to create one (fallback safety)
    if (!agent) {
      const { data: newAgent, error: createError } = await supabase
        .from('agents')
        .insert({
          auth_user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email || 'User',
          email: user.email || '',
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create agent:', createError)
        return NextResponse.json(
          { user, agent: null, error: 'Could not create agent profile' },
          { status: 500 }
        )
      }

      return NextResponse.json({ user, agent: newAgent })
    }

    return NextResponse.json({ user, agent })
  } catch (error) {
    console.error('Unexpected error in /api/user/me:', error)
    return NextResponse.json(
      { 
        user: null, 
        error: 'Server error' 
      },
      { status: 500 }
    )
  }
}
