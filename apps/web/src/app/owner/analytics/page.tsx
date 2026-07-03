'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function OwnerAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['owner-analytics'],
    queryFn: async () => (await api.get('/owner/analytics')).data.data,
  });

  const totals = data?.totals || { total_leads: 0, closed_leads: 0, total_spent: 0, current_balance: 0 };
  const properties = data?.properties || [];
  const creditUsage = data?.credit_usage || { labels: [], data: [] };
  const leadTypes = data?.lead_types || { labels: [], data: [] };

  return (
    <div>
      <h1 className="font-display font-black text-3xl mb-2">📊 My Analytics</h1>
      <p className="text-ink-900/60">How your properties are performing</p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8">
        <div className="p-5 rounded-2xl bg-coral-500 text-white">
          <div className="text-xs uppercase tracking-wide opacity-80">Total Leads</div>
          <div className="font-display font-black text-3xl mt-2">{isLoading ? '...' : totals.total_leads}</div>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-500 text-white">
          <div className="text-xs uppercase tracking-wide opacity-80">Closed Deals</div>
          <div className="font-display font-black text-3xl mt-2">{isLoading ? '...' : totals.closed_leads}</div>
        </div>
        <div className="p-5 rounded-2xl bg-ink-900 text-cream">
          <div className="text-xs uppercase tracking-wide opacity-70">Credits Spent</div>
          <div className="font-display font-black text-3xl mt-2">{isLoading ? '...' : Number(totals.total_spent).toLocaleString()}</div>
        </div>
        <div className="p-5 rounded-2xl bg-violet-500 text-white">
          <div className="text-xs uppercase tracking-wide opacity-80">Current Balance</div>
          <div className="font-display font-black text-3xl mt-2">{isLoading ? '...' : Number(totals.current_balance).toLocaleString()}</div>
        </div>
      </div>

      {/* Property performance */}
      <div className="bg-white p-6 rounded-2xl border border-ink-900/10 mb-6">
        <h2 className="font-display font-bold text-xl mb-4">🏠 Property performance</h2>
        {properties.length === 0 ? (
          <p className="text-ink-900/50">
            No properties listed yet.{' '}
            <Link href="/owner/properties/new" className="text-coral-600 font-semibold">+ Add property</Link>
          </p>
        ) : (
          properties.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between py-3 border-b border-ink-900/5 last:border-0">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-ink-900/60">📍 {p.locality_name || p.locality?.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  <strong>{p.leads_count || 0}</strong> leads ·{' '}
                  <strong className="text-emerald-700">{p.closed_leads_count || 0}</strong> closed
                </div>
                <div className="text-xs text-ink-900/60 mt-1">{p.view_count || 0} views</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit usage chart */}
        <div className="bg-white p-6 rounded-2xl border border-ink-900/10">
          <h2 className="font-display font-bold text-xl mb-1">💰 Credit usage (6 months)</h2>
          <p className="text-sm text-ink-900/60 mb-4">Monthly credit spending</p>
          <div className="space-y-2">
            {(creditUsage.labels || []).length === 0 ? (
              <div className="h-32 flex items-center justify-center text-ink-900/50">No data</div>
            ) : (
              creditUsage.labels.map((label: string, idx: number) => {
                const max = Math.max(...creditUsage.data, 1);
                const pct = (creditUsage.data[idx] / max) * 100;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-16 text-xs">{label}</div>
                    <div className="flex-1 bg-ink-900/5 rounded-full h-6 overflow-hidden">
                      <div className="bg-coral-500 h-full flex items-center px-3 text-white text-xs font-bold" style={{ width: `${pct}%` }}>
                        {creditUsage.data[idx]}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lead types */}
        <div className="bg-white p-6 rounded-2xl border border-ink-900/10">
          <h2 className="font-display font-bold text-xl mb-1">🎯 Lead types received</h2>
          <p className="text-sm text-ink-900/60 mb-4">Quality breakdown</p>
          {(leadTypes.labels || []).length === 0 ? (
            <div className="h-32 flex items-center justify-center text-ink-900/50">No data</div>
          ) : (
            <div className="space-y-3">
              {leadTypes.labels.map((label: string, idx: number) => {
                const colors = ['bg-ink-900', 'bg-coral-500', 'bg-emerald-500', 'bg-violet-500'];
                const total = leadTypes.data.reduce((s: number, n: number) => s + n, 0) || 1;
                const pct = ((leadTypes.data[idx] / total) * 100).toFixed(1);
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${colors[idx % colors.length]}`}></div>
                    <div className="flex-1 capitalize">{label}</div>
                    <div className="text-sm font-bold">{leadTypes.data[idx]} ({pct}%)</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
