import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (agentError || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const serviceClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error: credentialsError } = await serviceClient
    .from('credentials')
    .select('*')
    .eq('agent_id', agent.id)
    .single()

  if (credentialsError) {
    return NextResponse.json(
      { error: 'Credentials not found', details: credentialsError },
      { status: 500 }
    )
  }

  return NextResponse.json({ oauth: data })
}
