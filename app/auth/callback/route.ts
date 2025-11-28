import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) return NextResponse.redirect("/login");
  return NextResponse.redirect("/dashboard");
}
