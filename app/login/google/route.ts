import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://flowagent-psi.vercel.app/auth/callback"
    }
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.redirect(data.url);
}
