import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ email_connected: null }, { status: 401 })
  }

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (agentError || !agent) {
    return NextResponse.json({ email_connected: null }, { status: 404 })
  }

  const { data } = await supabase
    .from('client_credentials')
    .select('email_connected')
    .eq('agent_id', agent.id)
    .single()

  return NextResponse.json({
    email_connected: data?.email_connected ?? null,
  })
}
