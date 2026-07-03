'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
}

export default function AdminLeads() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState({ search: '', status: '' });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['admin-leads', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.search) params.search = filter.search;
      if (filter.status) params.status = filter.status;
      return (await api.get('/admin/leads', { params })).data.data;
    },
  });

  const { data: telecallers } = useQuery({
    queryKey: ['telecallers'],
    queryFn: async () => (await api.get('/admin/users', { params: { role: 'telecaller' } })).data.data,
  });

  const assign = async (leadId: number, telecaller_id: string) => {
    try {
      await api.patch(`/admin/leads/${leadId}/assign`, { telecaller_id });
      toast.success('Assigned');
      qc.invalidateQueries({ queryKey: ['admin-leads'] });
    } catch { toast.error('Failed'); }
  };

  const statuses = ['new', 'contacted', 'interested', 'follow_up', 'visit_scheduled', 'visit_done', 'closed_won', 'closed_lost', 'junk'];

  return (
    <div>
      {/* Header - EXACT Laravel */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-black text-3xl">All leads</h1>
          <Link href="/admin/leads/new" className="px-4 py-2 bg-coral-500 text-white rounded-lg font-semibold text-sm">+ Add Manual</Link>
        </div>
        <div className="flex gap-2">
          <input
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            placeholder="Name / phone…"
            className="px-3 py-2 rounded-lg border border-ink-900/15"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 rounded-lg border border-ink-900/15"
          >
            <option value="">All status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table - EXACT Laravel */}
      <div className="bg-white rounded-2xl border border-ink-900/10 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900/5 text-left text-ink-900/60 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th>Property</th>
                <th>Status</th>
                <th>Assigned to</th>
                <th>When</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads?.map((lead: any) => (
                <tr key={lead.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-xs text-ink-900/50">{lead.phone} · {lead.source}</div>
                  </td>
                  <td className="text-xs">{lead.property?.name || lead.property_name || 'General inquiry'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusBadge(lead.status)}`}>
                      {lead.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-xs">{lead.telecaller?.name || lead.telecaller_name || '—'}</td>
                  <td className="text-xs text-ink-900/60">{lead.created_at && timeAgo(lead.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <select
                        defaultValue={lead.assigned_telecaller_id || ''}
                        onChange={(e) => assign(lead.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-ink-900/15"
                      >
                        <option value="">Assign…</option>
                        {telecallers?.map((tc: any) => (
                          <option key={tc.id} value={tc.id}>{tc.name}</option>
                        ))}
                      </select>
                    </div>
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
