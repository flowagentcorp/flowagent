import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <main className="p-10 text-white">
      <h1 className="text-3xl font-bold">Welcome {data.user.email} 👑</h1>
      <p className="text-slate-400 mt-2">You are now authenticated via Supabase.</p>
    </main>
  );
}
