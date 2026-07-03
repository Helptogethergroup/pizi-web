'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';

export default function OwnerTenants() {
  const [filter, setFilter] = useState({ q: '', status: '', kyc: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['owner-tenants', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.q) params.q = filter.q;
      if (filter.status) params.status = filter.status;
      if (filter.kyc) params.kyc = filter.kyc;
      return (await api.get('/owner/tenants', { params })).data.data;
    },
  });

  const stats = data?.stats || { total: 0, active: 0, pending_kyc: 0, notice: 0 };
  const tenants = data?.tenants || data?.items || data || [];
  const tenantsList = Array.isArray(tenants) ? tenants : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">My Tenants</h1>
          <p className="text-ink-900/60 mt-1">Manage all your PG tenants</p>
        </div>
        <Link href="/owner/tenants/new" className="px-5 py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold shadow-lg shadow-coral-500/30">+ Add Tenant</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-ink-900/10">
          <div className="text-xs text-ink-900/50 uppercase font-bold">Total Tenants</div>
          <div className="font-display font-black text-3xl mt-1">{stats.total || tenantsList.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200">
          <div className="text-xs text-emerald-700 uppercase font-bold">Active</div>
          <div className="font-display font-black text-3xl text-emerald-700 mt-1">{stats.active}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200">
          <div className="text-xs text-amber-700 uppercase font-bold">Pending KYC</div>
          <div className="font-display font-black text-3xl text-amber-700 mt-1">{stats.pending_kyc}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200">
          <div className="text-xs text-rose-700 uppercase font-bold">Notice Period</div>
          <div className="font-display font-black text-3xl text-rose-700 mt-1">{stats.notice}</div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-ink-900/10 mb-4 flex gap-2 flex-wrap">
        <input
          value={filter.q}
          onChange={(e) => setFilter({ ...filter, q: e.target.value })}
          placeholder="Name, phone, room..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm"
        />
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="notice_period">Notice Period</option>
          <option value="left">Left</option>
        </select>
        <select value={filter.kyc} onChange={(e) => setFilter({ ...filter, kyc: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All KYC</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : tenantsList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-ink-900/70 mb-4">No tenants yet. Add your first tenant!</p>
          <Link href="/owner/tenants/new" className="inline-block px-5 py-3 bg-coral-500 text-white rounded-xl font-bold">+ Add First Tenant</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tenantsList.map((t: any) => (
            <div key={t.id} className="bg-white p-4 rounded-2xl border border-ink-900/10 hover:border-coral-300 transition">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-12 h-12 rounded-full bg-coral-100 text-coral-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {t.name?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold">{t.name}</h3>
                    {t.status === 'active' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Active</span>}
                    {t.status === 'notice_period' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Notice</span>}
                    {t.status === 'left' && <span className="text-xs bg-ink-200 text-ink-700 px-2 py-0.5 rounded-full font-bold">Left</span>}
                    {t.status === 'blacklisted' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Blacklisted</span>}

                    {t.kyc_status === 'approved' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">✓ KYC Verified</span>}
                    {t.kyc_status === 'submitted' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">📋 KYC Submitted</span>}
                    {t.kyc_status === 'rejected' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">❌ KYC Rejected</span>}
                    {(!t.kyc_status || t.kyc_status === 'pending') && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">⏳ KYC Pending</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-900/70 flex-wrap">
                    <span>📞 {t.phone}</span>
                    {t.room_number && <span>🚪 Room {t.room_number}</span>}
                    <span>🏠 {t.property?.name || t.property_name}</span>
                    {t.monthly_rent > 0 && <span className="font-bold text-coral-600">{formatINR(t.monthly_rent)}/mo</span>}
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  <Link href={`/owner/tenants/${t.id}`} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold">👁 View</Link>
                  <Link href={`/owner/tenants/${t.id}/edit`} className="px-3 py-2 bg-ink-100 hover:bg-ink-200 text-ink-950 rounded-lg text-xs font-bold">✏ Edit</Link>
                  <a href={`https://wa.me/91${t.phone}`} target="_blank" rel="noreferrer" className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold">💬 WA</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
