import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const res = new NextResponse();
  const session = await getSession(req, res);

  const agent_id = session.user?.agent_id;

  if (!agent_id) {
    return NextResponse.json({ email_connected: null });
  }

  const { data } = await supabase
    .from("client_credentials")
    .select("email_connected")
    .eq("agent_id", agent_id)
    .single();

  return NextResponse.json({
    email_connected: data?.email_connected ?? null,
  });
}
