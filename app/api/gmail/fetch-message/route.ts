import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function gmailFetch(accessToken: string, messageId: string) {
  return fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messageId = body.messageId

    if (!messageId)
      return NextResponse.json(
        { error: 'messageId required' },
        { status: 400 }
      )

    const supabaseServer = await createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser()

    if (error || !user)
      return NextResponse.json(
        { error: 'Not authenticated (no user)' },
        { status: 401 }
      )

    const { data: agent, error: agentError } = await supabaseServer
      .from('agents')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (agentError || !agent)
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )

    const { data: creds, error: credsError } = await supabase
      .from('client_credentials')
      .select('access_token, refresh_token, expiry_timestamp, email_connected')
      .eq('agent_id', agent.id)
      .single()

    if (credsError || !creds)
      return NextResponse.json(
        { error: 'Credentials not found', details: credsError },
        { status: 404 }
      )

    let { access_token, refresh_token } = creds

    let r = await gmailFetch(access_token, messageId)

    if (r.status === 401 || r.status === 403) {
      const refreshResp = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent_id: agent.id, refresh_token }),
        }
      )

      const newTok = await refreshResp.json()
      access_token = newTok.access_token
      r = await gmailFetch(access_token, messageId)
    }

    if (!r.ok)
      return NextResponse.json(
        { error: 'Failed to fetch from Gmail', status: r.status },
        { status: r.status }
      )

    const msg = await r.json()

    const headers = msg.payload?.headers || []
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
        ?.value || null

    const from = getHeader('From') || ''
    const subject = getHeader('Subject') || ''
    const to = getHeader('To') || ''

    let body_plain = ''
    if (msg.payload?.parts) {
      const part =
        msg.payload.parts.find((p: any) => p.mimeType === 'text/plain') ||
        msg.payload.parts.find((p: any) => p.mimeType === 'text/html')
      if (part?.body?.data)
        body_plain = Buffer.from(part.body.data, 'base64').toString('utf8')
    }

    if (!body_plain) body_plain = msg.snippet || ''

    const emailObj = {
      external_message_id: msg.id,
      subject,
      from_email: from.match(/<(.+)>/)?.[1] || from,
      from_name: from.split('<')[0].trim(),
      to_email: to,
      body_plain,
      received_at: new Date(parseInt(msg.internalDate)).toISOString(),
      source: 'gmail',
    }

    const finalPayload = { agent_id: agent.id, email: emailObj }

    if (process.env.N8N_WEBHOOK_URL) {
      await fetch(process.env.N8N_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      })
    }

    return NextResponse.json({ success: true, payload: finalPayload })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'fetch-message failed' },
      { status: 500 }
    )
  }
}
