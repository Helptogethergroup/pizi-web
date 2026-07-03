'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function statusBadge(status: string) {
  const map: any = {
    new: 'bg-coral-50 text-coral-900',
    contacted: 'bg-sky-100 text-sky-900',
    interested: 'bg-violet-100 text-violet-900',
    follow_up: 'bg-amber-100 text-amber-900',
    visit_scheduled: 'bg-sky-100 text-sky-900',
    visit_done: 'bg-emerald-100 text-emerald-900',
    closed_won: 'bg-emerald-200 text-emerald-900',
    closed_lost: 'bg-rose-100 text-rose-900',
    junk: 'bg-ink-900/10 text-ink-900/60',
  };
  return map[status] || 'bg-ink-900/10 text-ink-900/60';
}

function timeAgo(date: string) {
  if (!date) return '—';
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day ago`;
  return `${Math.floor(diff / 604800)} weeks ago`;
}

export default function TelecallerLeads() {
  const [filter, setFilter] = useState({ search: '', status: '' });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['telecaller-leads', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.search) params.search = filter.search;
      if (filter.status) params.status = filter.status;
      return (await api.get('/telecaller/leads', { params })).data.data;
    },
  });

  const statuses = ['new', 'contacted', 'interested', 'follow_up', 'visit_scheduled', 'visit_done', 'closed_won', 'closed_lost', 'junk'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-black text-3xl">My leads</h1>
          <Link href="/leads/manual/new" className="px-4 py-2 bg-coral-500 text-white rounded-lg font-semibold text-sm">+ Add Lead</Link>
        </div>
        <div className="flex gap-2">
          <input
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            placeholder="Name / phone…"
            className="px-3 py-2 rounded-lg border border-ink-900/15"
          />
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="px-3 py-2 rounded-lg border border-ink-900/15">
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/10 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (leads || []).length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🎯</div>
            <p className="text-ink-900/70">No leads assigned yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900/5 text-left text-ink-900/60 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th>Property</th>
                <th>Status</th>
                <th>Last contact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads?.map((lead: any) => (
                <tr key={lead.id} className="border-t border-ink-900/5 hover:bg-ink-900/5">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-xs text-ink-900/50">📞 {lead.phone}</div>
                  </td>
                  <td className="text-xs">{lead.property?.name || lead.property_name || 'General'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusBadge(lead.status)}`}>
                      {lead.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-xs text-ink-900/60">{lead.last_contacted_at ? timeAgo(lead.last_contacted_at) : '—'}</td>
                  <td className="px-4 py-3 space-x-1">
                    <Link href={`/telecaller/leads/${lead.id}`} className="text-xs px-3 py-1.5 rounded bg-ink-900 text-cream font-semibold inline-block">Open</Link>
                    <a href={`tel:${lead.phone}`} className="text-xs px-3 py-1.5 rounded bg-emerald-500 text-white font-semibold inline-block">📞 Call</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
