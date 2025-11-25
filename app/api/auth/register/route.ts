import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { full_name, email, phone } = await req.json();

  const agent_id = crypto.randomUUID();

  const { error } = await supabase.from("agents").insert({
    id: agent_id,
    full_name,
    email,
    phone,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const res = NextResponse.json({ success: true, agent_id });
  const session = await getSession(req, res);

  session.user = {
    agent_id,
    email,
  };

  await session.save();
  return res;
}
