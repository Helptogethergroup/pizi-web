'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data.data,
  });

  const stats = data?.stats || {};

  const cards = [
    { label: 'Total Properties', value: stats.total_properties || 0, icon: '🏠', color: 'bg-blue-50 text-blue-700', href: '/admin/properties' },
    { label: 'Verified', value: stats.verified_properties || 0, icon: '✅', color: 'bg-emerald-50 text-emerald-700', href: '/admin/properties?verified=1' },
    { label: 'Total Owners', value: stats.total_owners || 0, icon: '👨‍💼', color: 'bg-violet-50 text-violet-700', href: '/admin/users?role=owner' },
    { label: 'Total Tenants', value: stats.total_tenants || 0, icon: '👥', color: 'bg-coral-50 text-coral-700', href: '/admin/tenants' },
    { label: 'Total Users', value: stats.total_users || 0, icon: '👤', color: 'bg-cyan-50 text-cyan-700', href: '/admin/users' },
    { label: 'Total Leads', value: stats.total_leads || 0, icon: '📞', color: 'bg-amber-50 text-amber-700', href: '/admin/leads' },
    { label: 'New Leads', value: stats.new_leads || 0, icon: '🆕', color: 'bg-rose-50 text-rose-700', href: '/admin/leads?status=new' },
    { label: 'Open Complaints', value: stats.open_complaints || 0, icon: '🛠️', color: 'bg-orange-50 text-orange-700', href: '/admin/complaints?status=open' },
    { label: 'Total Revenue', value: formatINR(stats.total_revenue || 0), icon: '💎', color: 'bg-emerald-50 text-emerald-700', href: '/admin/rent' },
    { label: 'This Month', value: formatINR(stats.month_revenue || 0), icon: '📈', color: 'bg-teal-50 text-teal-700', href: '/admin/rent' },
  ];

  return (
    <div>
      <h1 className="font-display font-black text-3xl text-ink-950 mb-1">Admin Overview</h1>
      <p className="text-ink-700 mb-8">Platform-wide stats and management</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card hover:shadow-lg transition group">
            <div className={`inline-flex w-10 h-10 items-center justify-center rounded-xl text-xl mb-2 ${c.color}`}>{c.icon}</div>
            <div className="text-xs text-ink-500 uppercase font-bold">{c.label}</div>
            <div className="font-display font-black text-2xl text-ink-950 mt-0.5 group-hover:text-coral-500 transition">
              {isLoading ? '...' : c.value}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Leads + Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-display font-bold text-xl mb-3">📞 Recent Leads</h2>
          {data?.recent_leads?.length === 0 ? (
            <p className="text-ink-700 text-sm py-3">No leads yet</p>
          ) : (
            <div className="space-y-2">
              {data?.recent_leads?.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                  <div>
                    <div className="font-bold text-sm">{l.name}</div>
                    <div className="text-xs text-ink-700">📞 {l.phone}</div>
                  </div>
                  <span className="badge bg-coral-50 text-coral-700">{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-display font-bold text-xl mb-3">🏠 Recent Properties</h2>
          {data?.recent_properties?.length === 0 ? (
            <p className="text-ink-700 text-sm py-3">No properties yet</p>
          ) : (
            <div className="space-y-2">
              {data?.recent_properties?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                  <div>
                    <div className="font-bold text-sm">{p.name}</div>
                    <div className="text-xs text-ink-700">{p.is_verified == 1 ? '✓ Verified' : '⏳ Pending verification'}</div>
                  </div>
                  <span className="font-bold text-coral-500 text-sm">{formatINR(p.rent_min)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
