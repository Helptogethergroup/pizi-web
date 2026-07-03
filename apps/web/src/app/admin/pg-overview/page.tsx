'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';

function timeAgo(d: string) {
  if (!d) return '';
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
}

export default function AdminPgOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-pg-overview'],
    queryFn: async () => (await api.get('/admin/pg-overview')).data.data,
  });

  const stats = data?.stats || {};
  const topOwners = data?.top_owners || [];
  const urgentComplaints = data?.urgent_complaints || [];
  const recentTenants = data?.recent_tenants || [];
  const recentBills = data?.recent_bills || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">🏠 PG Management Overview</h1>
        <p className="text-ink-900/60 mt-1">Platform-wide tenant operations dashboard</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Link href="/admin/tenants" className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl text-white hover:scale-[1.02] transition">
          <div className="text-xs uppercase font-bold opacity-80">Active Tenants</div>
          <div className="font-display font-black text-4xl mt-1">{isLoading ? '...' : stats.active_tenants || 0}</div>
          <div className="text-xs opacity-70 mt-1">Total: {stats.total_tenants || 0}</div>
        </Link>

        <Link href="/admin/tenants?kyc=submitted" className="bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-2xl text-white hover:scale-[1.02] transition">
          <div className="text-xs uppercase font-bold opacity-80">Pending KYC</div>
          <div className="font-display font-black text-4xl mt-1">{isLoading ? '...' : stats.pending_kyc || 0}</div>
          <div className="text-xs opacity-70 mt-1">Need verification</div>
        </Link>

        <Link href="/admin/complaints?priority=urgent" className="bg-gradient-to-br from-rose-500 to-rose-600 p-5 rounded-2xl text-white hover:scale-[1.02] transition">
          <div className="text-xs uppercase font-bold opacity-80">Urgent Complaints</div>
          <div className="font-display font-black text-4xl mt-1">{isLoading ? '...' : stats.urgent_complaints || 0}</div>
          <div className="text-xs opacity-70 mt-1">Need immediate action</div>
        </Link>

        <Link href="/admin/rent" className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl text-white hover:scale-[1.02] transition">
          <div className="text-xs uppercase font-bold opacity-80">Collected This Month</div>
          <div className="font-display font-black text-3xl mt-1">{formatINR(stats.collected_month || 0)}</div>
          <div className="text-xs opacity-70 mt-1">Platform revenue</div>
        </Link>

        <Link href="/admin/rent?status=overdue" className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-2xl text-white hover:scale-[1.02] transition">
          <div className="text-xs uppercase font-bold opacity-80">Pending Dues</div>
          <div className="font-display font-black text-3xl mt-1">{formatINR(stats.pending_dues || 0)}</div>
          <div className="text-xs opacity-70 mt-1">{stats.overdue_bills || 0} overdue bills</div>
        </Link>

        <Link href="/admin/complaints?status=open" className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-2xl text-white hover:scale-[1.02] transition">
          <div className="text-xs uppercase font-bold opacity-80">Open Complaints</div>
          <div className="font-display font-black text-4xl mt-1">{isLoading ? '...' : stats.open_complaints || 0}</div>
          <div className="text-xs opacity-70 mt-1">{stats.resolved_month || 0} resolved this month</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-ink-900/10">
          <div className="p-5 border-b border-ink-900/10">
            <h2 className="font-display font-bold text-lg">🏆 Top Property Owners</h2>
          </div>
          <div className="divide-y divide-ink-900/10">
            {topOwners.length === 0 ? (
              <div className="p-8 text-center text-ink-900/50">No owners with tenants yet.</div>
            ) : (
              topOwners.map((o: any) => (
                <div key={o.id} className="p-4 flex items-center gap-3 hover:bg-cream transition">
                  <div className="w-10 h-10 rounded-full bg-coral-100 text-coral-700 flex items-center justify-center font-bold">{o.name?.charAt(0).toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="font-bold">{o.name}</div>
                    <div className="text-xs text-ink-900/70">{o.phone || o.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-black text-lg text-coral-600">{o.tenants_count}</div>
                    <div className="text-xs text-ink-900/50">tenants</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200">
          <div className="p-5 border-b border-rose-100 flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">🚨 Urgent Complaints</h2>
            <Link href="/admin/complaints?priority=urgent" className="text-xs text-coral-500 font-bold">View All →</Link>
          </div>
          <div className="divide-y divide-rose-50">
            {urgentComplaints.length === 0 ? (
              <div className="p-8 text-center text-ink-900/50">No urgent complaints. All good! 🎉</div>
            ) : (
              urgentComplaints.map((c: any) => (
                <Link key={c.id} href={`/admin/complaints/${c.id}`} className="block p-4 hover:bg-rose-50 transition">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold">{c.ticket_number}</span>
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">🔴 Urgent</span>
                  </div>
                  <div className="font-bold text-sm">{c.title}</div>
                  <div className="text-xs text-ink-900/70 mt-1">{c.tenant?.name} · Owner: {c.owner?.name} · {timeAgo(c.created_at)}</div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-ink-900/10">
          <div className="p-5 border-b border-ink-900/10 flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">👥 Recent Tenants</h2>
            <Link href="/admin/tenants" className="text-xs text-coral-500 font-bold">View All →</Link>
          </div>
          <div className="divide-y divide-ink-900/10">
            {recentTenants.length === 0 ? (
              <div className="p-8 text-center text-ink-900/50">No tenants yet.</div>
            ) : (
              recentTenants.map((t: any) => (
                <Link key={t.id} href={`/admin/tenants/${t.id}`} className="block p-4 hover:bg-cream transition">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold">{t.name}</div>
                    {t.kyc_status === 'approved' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">✓ KYC</span>}
                    {t.kyc_status === 'submitted' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">📋 Review</span>}
                    {t.kyc_status === 'rejected' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">❌ Rejected</span>}
                  </div>
                  <div className="text-xs text-ink-900/70 mt-0.5">{t.property?.name} · {t.owner?.name} · {timeAgo(t.created_at)}</div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-ink-900/10">
          <div className="p-5 border-b border-ink-900/10 flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">💰 Recent Bills</h2>
            <Link href="/admin/rent" className="text-xs text-coral-500 font-bold">View All →</Link>
          </div>
          <div className="divide-y divide-ink-900/10">
            {recentBills.length === 0 ? (
              <div className="p-8 text-center text-ink-900/50">No bills yet.</div>
            ) : (
              recentBills.map((b: any) => (
                <Link key={b.id} href={`/admin/rent/${b.id}`} className="block p-4 hover:bg-cream transition">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="font-bold text-sm">{b.tenant?.name}</div>
                      <div className="text-xs text-ink-900/70">{b.month_label || b.month} · Owner: {b.owner?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatINR(b.total_amount)}</div>
                      {b.status === 'paid' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">✓ Paid</span>}
                      {b.status === 'overdue' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">⚠️ Overdue</span>}
                      {(b.status === 'pending' || b.status === 'partial') && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Pending</span>}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
