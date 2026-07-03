'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminAgreements() {
  const [filter, setFilter] = useState({ q: '', owner_id: '', status: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-agreements', filter],
    queryFn: async () => {
      const params: any = {};
      Object.entries(filter).forEach(([k, v]) => { if (v) params[k] = v; });
      return (await api.get('/admin/agreements', { params })).data.data;
    },
  });

  const { data: owners } = useQuery({
    queryKey: ['all-owners-agreements'],
    queryFn: async () => (await api.get('/admin/users', { params: { role: 'owner' } })).data.data,
  });

  const stats = data?.stats || { total: 0, active: 0, expiring: 0, draft: 0 };
  const agreements = data?.agreements || data || [];
  const list = Array.isArray(agreements) ? agreements : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">📄 All Rent Agreements</h1>
        <p className="text-ink-900/60 mt-1">Platform-wide agreement tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-ink-900/10">
          <div className="text-xs text-ink-900/50 uppercase font-bold">Total</div>
          <div className="font-display font-black text-3xl mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200">
          <div className="text-xs text-emerald-700 uppercase font-bold">Active</div>
          <div className="font-display font-black text-3xl text-emerald-700 mt-1">{stats.active}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200">
          <div className="text-xs text-amber-700 uppercase font-bold">Expiring (30d)</div>
          <div className="font-display font-black text-3xl text-amber-700 mt-1">{stats.expiring}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-ink-200">
          <div className="text-xs text-ink-900/70 uppercase font-bold">Drafts</div>
          <div className="font-display font-black text-3xl text-ink-900/70 mt-1">{stats.draft}</div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-ink-900/10 mb-4 flex gap-2 flex-wrap">
        <input value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} placeholder="Search..." className="flex-1 min-w-[180px] px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm" />
        <select value={filter.owner_id} onChange={(e) => setFilter({ ...filter, owner_id: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Owners</option>
          {owners?.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">📄</div>
          <p className="text-ink-900/70">No agreements found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((a: any) => (
            <Link key={a.id} href={`/admin/agreements/${a.id}`} className="block bg-white p-4 rounded-2xl border border-ink-900/10 hover:border-coral-300 transition">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-bold text-ink-900/50">#{a.agreement_number || a.id}</span>
                    {a.status === 'active' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Active</span>}
                    {a.status === 'draft' && <span className="text-xs bg-ink-100 text-ink-700 px-2 py-0.5 rounded-full font-bold">Draft</span>}
                    {a.status === 'expired' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Expired</span>}
                    {a.status === 'terminated' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Terminated</span>}
                  </div>
                  <h3 className="font-bold">{a.tenant?.name}</h3>
                  <div className="text-xs text-ink-900/70 mt-1">{a.property?.name} · Owner: {a.owner?.name}</div>
                  <div className="text-xs text-ink-900/50 mt-1">
                    {a.start_date && new Date(a.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {a.end_date && ` → ${new Date(a.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
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
