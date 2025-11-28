import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, user: data.user, session: data.session })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }
