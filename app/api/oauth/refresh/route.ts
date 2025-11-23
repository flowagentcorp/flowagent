import { NextResponse } from "next/server";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const agent_id = body.agent_id;

    if (!agent_id) {
      return NextResponse.json(
        { error: "agent_id_required" },
        { status: 400 }
      );
    }

    // 1) Get refresh_token from Supabase
    const getRes = await fetch(
      `${SUPABASE_URL}/rest/v1/client_credentials?agent_id=eq.${agent_id}&select=*`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      }
    );

    if (!getRes.ok) {
      const t = await getRes.text();
      throw new Error("Supabase load error: " + t);
    }

    const rows = await getRes.json();
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "not_found" },
        { status: 404 }
      );
    }

    const refresh_token = rows[0].refresh_token;

    if (!refresh_token) {
      return NextResponse.json(
        { error: "no_refresh_token" },
        { status: 400 }
      );
    }

    // 2) Exchange refresh token at Google
    const params = new URLSearchParams();
    params.append("client_id", GOOGLE_CLIENT_ID!);
    params.append("client_secret", GOOGLE_CLIENT_SECRET!);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refresh_token);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      throw new Error("Google refresh error: " + t);
    }

    const tokenData = await tokenRes.json();

    const expires_at = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    // 3) Save new access_token to Supabase
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/client_credentials?agent_id=eq.${agent_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        body: JSON.stringify({
          access_token: tokenData.access_token,
          expires_at,
        }),
      }
    );

    if (!updateRes.ok) {
      const t = await updateRes.text();
      throw new Error("Supabase update error: " + t);
    }

    return NextResponse.json({
      success: true,
      access_token: tokenData.access_token,
      expires_at,
    });
  } catch (err: any) {
    console.error("refresh error:", err);
    return NextResponse.json(
      { error: "server_error", details: err.message },
      { status: 500 }
    );
  }
}
