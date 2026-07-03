'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminAnalytics() {
  const { data } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => (await api.get('/admin/analytics')).data.data,
  });

  const revenue = data?.revenue || { total: 0, counts: [], daily: [] };
  const funnel = data?.funnel || [];
  const totalLeads = funnel[0]?.count || 0;
  const closed = funnel[funnel.length - 1]?.count || 0;
  const convRate = totalLeads > 0 ? Math.round((closed / totalLeads) * 1000) / 10 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-3xl">📊 Analytics</h1>
          <p className="text-ink-900/60 mt-1">Business insights · Last 30 days</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-ink-900 text-cream rounded-lg text-sm">🔄 Refresh</button>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="text-xs uppercase tracking-wide opacity-80">Revenue (30d)</div>
          <div className="font-display font-black text-3xl mt-2">₹{Number(revenue.total).toLocaleString()}</div>
          <div className="text-xs opacity-70 mt-1">{(revenue.counts || []).reduce((a: number, b: number) => a + b, 0)} transactions</div>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-coral-500 to-coral-600 text-white">
          <div className="text-xs uppercase tracking-wide opacity-80">Total Leads</div>
          <div className="font-display font-black text-3xl mt-2">{totalLeads}</div>
          <div className="text-xs opacity-70 mt-1">All time</div>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <div className="text-xs uppercase tracking-wide opacity-80">Closed Won</div>
          <div className="font-display font-black text-3xl mt-2">{closed}</div>
          <div className="text-xs opacity-70 mt-1">{convRate}% conversion</div>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-ink-900 to-ink-950 text-cream">
          <div className="text-xs uppercase tracking-wide opacity-80">Avg Daily Revenue</div>
          <div className="font-display font-black text-3xl mt-2">₹{Math.round((revenue.total || 0) / 30).toLocaleString()}</div>
          <div className="text-xs opacity-70 mt-1">Per day · 30d avg</div>
        </div>
      </div>

      {/* Revenue chart placeholder */}
      <div className="bg-white p-6 rounded-2xl border border-ink-900/10 mb-6">
        <h2 className="font-display font-bold text-xl mb-1">Revenue trend</h2>
        <p className="text-sm text-ink-900/60 mb-4">Daily revenue from credit purchases</p>
        <div className="h-64 flex items-center justify-center bg-cream rounded-xl">
          <div className="text-center text-ink-900/40">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-sm">Chart data will load from API</p>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white p-6 rounded-2xl border border-ink-900/10">
        <h2 className="font-display font-bold text-xl mb-4">Lead funnel</h2>
        <div className="space-y-3">
          {funnel.map((stage: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-32 text-sm capitalize">{stage.status?.replace('_', ' ')}</div>
              <div className="flex-1 bg-ink-900/5 rounded-full h-8 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-coral-500 to-coral-600 h-full flex items-center px-3 text-white text-sm font-bold"
                  style={{ width: `${totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0}%` }}
                >
                  {stage.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
