'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

export default function DashboardPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await apiFetch('/agents');
        setAgents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Agents</h1>
        <Link href="/sandbox">
          <button className="rounded-full bg-primary px-6 py-2 text-white hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-primary/20">
            Create New Agent
          </button>
        </Link>
      </div>

      {loading && <div className="text-center py-10">Loading agents...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {!loading && agents.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">You haven't created any agents yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div key={agent._id} className="rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {agent.description || 'No description provided.'}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${agent.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {agent.isActive ? 'Active' : 'Inactive'}
              </span>
              <button className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">View Build</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
