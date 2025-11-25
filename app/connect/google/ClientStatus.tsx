"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserResponse = {
  user?: {
    agent_id?: string;
    email?: string;
  } | null;
};

type CredentialsResponse = {
  email_connected?: string | null;
};

export default function ClientStatus() {
  const [loading, setLoading] = useState(true);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [emailConnected, setEmailConnected] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadSession() {
      const res = await fetch("/api/user/me");
      const data: UserResponse = await res.json();
      setAgentId(data.user?.agent_id ?? null);
    }

    async function loadCredentials() {
      const res = await fetch("/api/agent/credentials");
      if (res.ok) {
        const data: CredentialsResponse = await res.json();
        setEmailConnected(data.email_connected ?? null);
      }
      setLoading(false);
    }

    loadSession();
    loadCredentials();
  }, []);

  if (loading) return <p>Loading...</p>;

  const connectGoogle = () => {
    if (!agentId) return;
    router.push(`/api/oauth/google/start?agent_id=${agentId}`);
  };

  const disconnectGoogle = async () => {
    await fetch("/api/oauth/google/disconnect", {
      method: "POST",
    });
    window.location.reload();
  };

  return (
    <div className="p-6">
      {emailConnected ? (
        <div>
          <p className="mb-4 text-green-600 font-semibold">
            Gmail connected: {emailConnected}
          </p>
          <button
            onClick={disconnectGoogle}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Disconnect Gmail
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-gray-700">No Gmail connected</p>
          <button
            onClick={connectGoogle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Connect Gmail
          </button>
        </div>
      )}
    </div>
  );
}
