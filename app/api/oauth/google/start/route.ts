import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'User must be logged in' },
      { status: 401 }
    )
  }

  let { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (agentError || !agent) {
    const { data: newAgent, error: createError } = await supabase
      .from('agents')
      .insert({
        auth_user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
      })
      .select('id')
      .single()

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to create agent profile' },
        { status: 500 }
      )
    }
    agent = newAgent
  }

  const state = encodeURIComponent(JSON.stringify({ agent_id: agent.id }));

  const oauthUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.labels"
      ].join(" "),
      state,
    }).toString();

  return NextResponse.redirect(oauthUrl);
}
