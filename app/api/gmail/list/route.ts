// app/api/gmail/list/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const res = new NextResponse();
  const session = await getSession(req, res);

  if (!session.user?.agent_id) {
    return NextResponse.json(
      { error: "Not authenticated (no session)" },
      { status: 401 }
    );
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("agent_id", session.user.agent_id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Credentials not found", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json({ oauth: data });
}
