"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserResponse = {
  user?: {
    id?: string;
    email?: string;
  } | null;
  agent?: {
    id?: string;
    email?: string;
  } | null;
  error?: string;
};

type CredentialsResponse = {
  email_connected?: string | null;
  error?: string;
};

export default function ClientStatus() {
  const [loading, setLoading] = useState(true);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [emailConnected, setEmailConnected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        // First check if user is authenticated
        const userRes = await fetch("/api/user/me");
        const userData: UserResponse = await userRes.json();

        if (!userRes.ok || userData.error || !userData.user) {
          // User not authenticated, redirect to login
          setError("Please log in first");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        // Get agent ID from the response
        const agent_id = userData.agent?.id;

        if (!agent_id) {
          setError("Agent profile not found. Please contact support.");
          setLoading(false);
          return;
        }

        setAgentId(agent_id);

        // Now check credentials
        const credRes = await fetch("/api/agent/credentials");
        if (credRes.ok) {
          const credData: CredentialsResponse = await credRes.json();
          setEmailConnected(credData.email_connected ?? null);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const connectGoogle = () => {
    if (!agentId) {
      setError("Agent ID not found");
      return;
    }
    router.push(`/api/oauth/google/start?agent_id=${agentId}`);
  };

  const disconnectGoogle = async () => {
    try {
      await fetch("/api/oauth/google/disconnect", {
        method: "POST",
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to disconnect:", err);
      setError("Failed to disconnect Gmail");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gmail Integration</h1>

        {emailConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold text-green-900">Gmail Connected</p>
                <p className="text-sm text-green-700">{emailConnected}</p>
              </div>
            </div>
            <button
              onClick={disconnectGoogle}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Disconnect Gmail
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700">No Gmail connected</p>
              <p className="text-sm text-gray-500 mt-1">
                Connect your Gmail to sync emails with your CRM
              </p>
            </div>
            <button
              onClick={connectGoogle}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Connect Gmail
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
