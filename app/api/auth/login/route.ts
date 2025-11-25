import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json();

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const res = NextResponse.json({ success: true, agent_id: data.id });
  const session = await getSession(req, res);

  session.user = {
    agent_id: data.id,
    email: data.email,
  };

  await session.save();
  return res;
}
