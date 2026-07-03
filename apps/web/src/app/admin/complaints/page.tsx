'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function timeAgo(d: string) {
  if (!d) return '';
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

export default function AdminComplaints() {
  const [filter, setFilter] = useState({ q: '', owner_id: '', status: '', priority: '', category: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-complaints', filter],
    queryFn: async () => {
      const params: any = {};
      Object.entries(filter).forEach(([k, v]) => { if (v) params[k] = v; });
      return (await api.get('/admin/complaints', { params })).data.data;
    },
  });

  const { data: owners } = useQuery({
    queryKey: ['all-owners-complaints'],
    queryFn: async () => (await api.get('/admin/users', { params: { role: 'owner' } })).data.data,
  });

  const stats = data?.stats || { open: 0, urgent: 0, in_progress: 0, resolved_month: 0 };
  const complaints = data?.complaints || data || [];
  const list = Array.isArray(complaints) ? complaints : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">🛠️ All Complaints</h1>
        <p className="text-ink-900/60 mt-1">Platform-wide complaint tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-amber-200">
          <div className="text-xs text-amber-700 uppercase font-bold">Open</div>
          <div className="font-display font-black text-3xl text-amber-700 mt-1">{stats.open}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200">
          <div className="text-xs text-rose-700 uppercase font-bold">Urgent</div>
          <div className="font-display font-black text-3xl text-rose-700 mt-1">{stats.urgent}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-200">
          <div className="text-xs text-blue-700 uppercase font-bold">In Progress</div>
          <div className="font-display font-black text-3xl text-blue-700 mt-1">{stats.in_progress}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200">
          <div className="text-xs text-emerald-700 uppercase font-bold">Resolved (Month)</div>
          <div className="font-display font-black text-3xl text-emerald-700 mt-1">{stats.resolved_month}</div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-ink-900/10 mb-4 flex gap-2 flex-wrap">
        <input value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} placeholder="Title, ticket..." className="flex-1 min-w-[180px] px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm" />
        <select value={filter.owner_id} onChange={(e) => setFilter({ ...filter, owner_id: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Owners</option>
          {owners?.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Priority</option>
          <option value="urgent">🔴 Urgent</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">🛠️</div>
          <p className="text-ink-900/70">No complaints found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((c: any) => (
            <Link key={c.id} href={`/admin/complaints/${c.id}`} className="block bg-white p-4 rounded-2xl border border-ink-900/10 hover:border-coral-300 transition">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-bold text-ink-900/50">{c.ticket_number}</span>
                    <span className="text-xs bg-cream px-2 py-0.5 rounded-full font-bold capitalize">{c.category}</span>
                    {c.priority === 'urgent' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">🔴 Urgent</span>}
                    {c.priority === 'high' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">🟠 High</span>}
                    {c.priority === 'medium' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">🟡 Medium</span>}
                    {(c.status === 'resolved' || c.status === 'closed') && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold capitalize">{c.status}</span>}
                    {c.status === 'in_progress' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">In Progress</span>}
                    {c.status === 'open' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Open</span>}
                  </div>
                  <h3 className="font-bold">{c.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-ink-900/70 mt-1 flex-wrap">
                    <span>👤 {c.tenant?.name}</span>
                    <span>Owner: {c.owner?.name}</span>
                    <span>📅 {timeAgo(c.created_at)}</span>
                  </div>
                </div>
                <div className="text-2xl text-ink-900/30">→</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
