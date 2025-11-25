import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const res = new NextResponse();
  const session = await getSession(req, res);

  const agent_id = session.user?.agent_id;

  if (!agent_id) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from("client_credentials")
    .delete()
    .eq("agent_id", agent_id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  // SAFE UPDATE – avoids TS error
  if (session.user) {
    session.user.email = undefined;
  }

  await session.save();

  return NextResponse.json({ success: true });
}

