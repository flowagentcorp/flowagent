import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ user: null, error: error?.message }, { status: 401 })
  }

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .single()

  return NextResponse.json({ user, agent })
}
