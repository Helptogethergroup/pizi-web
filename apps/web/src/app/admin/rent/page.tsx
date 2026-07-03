'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';

export default function AdminRent() {
  const [filter, setFilter] = useState({ q: '', owner_id: '', month: '', status: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rent', filter],
    queryFn: async () => {
      const params: any = {};
      Object.entries(filter).forEach(([k, v]) => { if (v) params[k] = v; });
      return (await api.get('/admin/rent', { params })).data.data;
    },
  });

  const { data: owners } = useQuery({
    queryKey: ['all-owners-rent'],
    queryFn: async () => (await api.get('/admin/users', { params: { role: 'owner' } })).data.data,
  });

  const stats = data?.stats || { total_collected_month: 0, total_pending: 0, overdue_count: 0, total_bills: 0 };
  const bills = data?.bills || data || [];
  const list = Array.isArray(bills) ? bills : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">💰 All Rent Bills</h1>
        <p className="text-ink-900/60 mt-1">Platform-wide rent collection</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200">
          <div className="text-xs text-emerald-700 uppercase font-bold">Collected (Month)</div>
          <div className="font-display font-black text-2xl text-emerald-700 mt-1">{formatINR(stats.total_collected_month)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200">
          <div className="text-xs text-amber-700 uppercase font-bold">Pending</div>
          <div className="font-display font-black text-2xl text-amber-700 mt-1">{formatINR(stats.total_pending)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200">
          <div className="text-xs text-rose-700 uppercase font-bold">Overdue</div>
          <div className="font-display font-black text-3xl text-rose-700 mt-1">{stats.overdue_count}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-ink-900/10">
          <div className="text-xs text-ink-900/50 uppercase font-bold">Total Bills</div>
          <div className="font-display font-black text-3xl mt-1">{stats.total_bills}</div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-ink-900/10 mb-4 flex gap-2 flex-wrap">
        <input value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} placeholder="Tenant/owner/bill#..." className="flex-1 min-w-[180px] px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm" />
        <select value={filter.owner_id} onChange={(e) => setFilter({ ...filter, owner_id: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Owners</option>
          {owners?.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <input type="month" value={filter.month} onChange={(e) => setFilter({ ...filter, month: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm" />
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">💰</div>
          <p className="text-ink-900/70">No bills found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((bill: any) => (
            <Link key={bill.id} href={`/admin/rent/${bill.id}`} className="block bg-white p-4 rounded-2xl border border-ink-900/10 hover:border-coral-300 transition">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold">{bill.tenant?.name}</h3>
                    <span className="text-xs text-ink-900/50">·</span>
                    <span className="text-xs">{bill.month_label || bill.month}</span>
                    {bill.status === 'paid' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">✓ Paid</span>}
                    {bill.status === 'partial' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Partial</span>}
                    {bill.status === 'overdue' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">⚠️ Overdue</span>}
                    {bill.status === 'pending' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">⏳ Pending</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-900/70 flex-wrap">
                    <span>📞 {bill.tenant?.phone}</span>
                    <span>Owner: {bill.owner?.name}</span>
                    <span>📅 Due: {bill.due_date && new Date(bill.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    <span className="font-mono">#{bill.bill_number}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-black text-xl">{formatINR(bill.total_amount)}</div>
                  {bill.due_amount > 0 ? (
                    <div className="text-xs text-rose-600 font-bold">Due: {formatINR(bill.due_amount)}</div>
                  ) : (
                    <div className="text-xs text-emerald-600 font-bold">Paid</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
