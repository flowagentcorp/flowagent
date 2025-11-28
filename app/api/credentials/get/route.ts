import { NextResponse } from "next/server";

const { 
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY, 
  GOOGLE_CLIENT_ID, 
  GOOGLE_CLIENT_SECRET 
} = process.env;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const agent_id = url.searchParams.get("agent_id");

    if (!agent_id) {
      return NextResponse.json(
        { error: "agent_id_required" },
        { status: 400 }
      );
    }

    // Fetch credentials from Supabase REST endpoint
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/client_credentials?agent_id=eq.${agent_id}&select=*`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      }
    );

    if (!res.ok) {
      const t = await res.text();
      throw new Error("Supabase error: " + t);
    }

    const rows = await res.json();

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "credentials_not_found" },
        { status: 404 }
      );
    }

    const cred = rows[0];

    return NextResponse.json({
      agent_id: cred.agent_id,
      provider: cred.provider,
      access_token: cred.access_token,
      refresh_token: cred.refresh_token,
      token_type: cred.token_type,
      scope: cred.scope,
      expiry_timestamp: cred.expiry_timestamp,

      // Add client credentials from environment
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET
    });

  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error("credentials/get error:", error);
    return NextResponse.json(
      { error: "server_error", details: error.message },
      { status: 500 }
    );
  }
}
