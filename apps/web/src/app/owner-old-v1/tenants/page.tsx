'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';

export default function OwnerTenants() {
  const [filter, setFilter] = useState({ status: '', kyc: '', q: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['owner-tenants', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.status) params.status = filter.status;
      if (filter.kyc) params.kyc = filter.kyc;
      if (filter.q) params.q = filter.q;
      return (await api.get('/owner/tenants', { params })).data.data;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-ink-950">Tenants</h1>
          <p className="text-ink-700 mt-1">{data?.length || 0} tenants total</p>
        </div>
        <Link href="/owner/tenants/new" className="btn-primary">+ Add Tenant</Link>
      </div>

      {/* Filters */}
      <div className="card mb-5 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={filter.q}
            onChange={(e) => setFilter({ ...filter, q: e.target.value })}
            placeholder="Search by name or phone..."
            className="input"
          />
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="input">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="notice_period">Notice period</option>
            <option value="left">Left</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
          <select value={filter.kyc} onChange={(e) => setFilter({ ...filter, kyc: e.target.value })} className="input">
            <option value="">All KYC</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : data?.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">👥</div>
          <h3 className="font-display font-bold text-xl">No tenants yet</h3>
          <p className="text-ink-700 mt-2">Add your first tenant to get started</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-700 text-xs uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Property</th>
                  <th className="px-4 py-3 text-left">Room</th>
                  <th className="px-4 py-3 text-right">Rent</th>
                  <th className="px-4 py-3 text-center">KYC</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.map((t: any) => (
                  <tr key={t.id} className="border-t border-ink-100 hover:bg-cream">
                    <td className="px-4 py-3 font-bold">{t.name}</td>
                    <td className="px-4 py-3">{t.phone}</td>
                    <td className="px-4 py-3 text-xs">{t.property_name || '—'}</td>
                    <td className="px-4 py-3 text-xs">{t.room_number ? `Room ${t.room_number}${t.bed_number ? `/${t.bed_number}` : ''}` : '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-coral-500">{formatINR(t.monthly_rent)}</td>
                    <td className="px-4 py-3 text-center">
                      {t.kyc_status === 'approved' && <span className="badge bg-emerald-100 text-emerald-700">✓ Approved</span>}
                      {t.kyc_status === 'pending' && <span className="badge bg-amber-100 text-amber-700">⏳ Pending</span>}
                      {t.kyc_status === 'rejected' && <span className="badge bg-rose-100 text-rose-700">✗ Rejected</span>}
                      {t.kyc_status === 'submitted' && <span className="badge bg-blue-100 text-blue-700">📋 Submitted</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge capitalize ${
                        t.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        t.status === 'notice_period' ? 'bg-amber-100 text-amber-700' :
                        t.status === 'left' ? 'bg-ink-100 text-ink-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>{t.status?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/owner/tenants/${t.id}`} className="text-coral-500 font-bold hover:underline">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
