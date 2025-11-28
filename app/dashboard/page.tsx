import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('*')
    .single()

  if (agentError || !agent) return <div>Error loading agent profile</div>

  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: messages } = await supabase
    .from('messages')
    .select(`*, leads (name, email)`)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: tasks } = await supabase
    .from('scheduled_tasks')
    .select(`*, leads (name, email)`)
    .eq('status', 'pending')
    .order('scheduled_for', { ascending: true })
    .limit(5)

  return (
    <main className="p-10 text-white space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome {agent.full_name ?? agent.email}</h1>
        <p className="text-slate-400">You are now authenticated via Supabase.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Leads</h2>
          {leadsError ? (
            <p className="text-sm text-red-400">Failed to load leads.</p>
          ) : (
            <ul className="space-y-3">
              {(leads ?? []).map((lead) => (
                <li key={lead.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-slate-400">{lead.email}</p>
                  <p className="text-xs text-slate-500">Status: {lead.status}</p>
                </li>
              ))}
              {!leads?.length && (
                <li className="text-sm text-slate-400">No leads yet.</li>
              )}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
          <ul className="space-y-3">
            {(tasks ?? []).map((task) => (
              <li key={task.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-medium">{task.title ?? 'Task'}</p>
                <p className="text-sm text-slate-400">
                  Lead: {task.leads?.name ?? 'N/A'} ({task.leads?.email ?? 'No email'})
                </p>
                <p className="text-xs text-slate-500">Scheduled for: {task.scheduled_for}</p>
              </li>
            ))}
            {!tasks?.length && (
              <li className="text-sm text-slate-400">No tasks scheduled.</li>
            )}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
        <ul className="space-y-3">
          {(messages ?? []).map((message) => (
            <li key={message.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-medium">{message.subject ?? 'Message'}</p>
              <p className="text-sm text-slate-400">{message.leads?.name ?? 'Lead'}</p>
              <p className="text-xs text-slate-500">{message.created_at}</p>
            </li>
          ))}
          {!messages?.length && (
            <li className="text-sm text-slate-400">No messages yet.</li>
          )}
        </ul>
      </section>
    </main>
  )
}
