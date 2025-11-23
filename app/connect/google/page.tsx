"use client";

export default function ConnectGoogle() {
  // Neskôr nahradíme user.id zo Supabase
  const agentId = "00000000-0000-0000-0000-000000000001";

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Connect Gmail</h1>

      <div className="text-sm text-gray-600 mb-6">
        <p>DEBUG:</p>
        <p>Agent ID: {agentId}</p>
      </div>

      {/* Správna cesta na spustenie OAuth flow */}
      <a
        href={`/api/oauth/google/start?agent_id=${agentId}`}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Connect Google Account
      </a>
    </div>
  );
}
