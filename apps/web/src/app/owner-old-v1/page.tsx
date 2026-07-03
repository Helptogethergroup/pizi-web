'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function OwnerDashboard() {
  const user = useAuth((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: async () => (await api.get('/owner/dashboard')).data.data,
  });

  const stats = data?.stats || {};

  const cards = [
    { label: 'Total Properties', value: stats.total_properties || 0, icon: '🏠', color: 'bg-blue-50 text-blue-700', href: '/owner/properties' },
    { label: 'Active Tenants', value: stats.total_tenants || 0, icon: '👥', color: 'bg-emerald-50 text-emerald-700', href: '/owner/tenants' },
    { label: 'Pending Dues', value: formatINR(stats.pending_dues || 0), icon: '💸', color: 'bg-rose-50 text-rose-700', href: '/owner/rent' },
    { label: 'Open Complaints', value: stats.open_complaints || 0, icon: '🛠️', color: 'bg-amber-50 text-amber-700', href: '/owner/complaints' },
    { label: 'Total Rooms', value: stats.total_rooms || 0, icon: '🚪', color: 'bg-violet-50 text-violet-700', href: '/owner/rooms' },
    { label: 'Vacant Beds', value: stats.vacant_beds || 0, icon: '🛏️', color: 'bg-cyan-50 text-cyan-700', href: '/owner/rooms' },
    { label: 'Occupied Beds', value: stats.occupied_beds || 0, icon: '✅', color: 'bg-teal-50 text-teal-700', href: '/owner/rooms' },
    { label: 'Month Collection', value: formatINR(stats.month_collection || 0), icon: '📈', color: 'bg-green-50 text-green-700', href: '/owner/rent' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-ink-950">Welcome, {user?.name}! 👋</h1>
        <p className="text-ink-700 mt-1">Here's your PG operations overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card hover:shadow-lg transition group">
            <div className={`inline-flex w-10 h-10 items-center justify-center rounded-xl text-xl mb-3 ${c.color}`}>
              {c.icon}
            </div>
            <div className="text-xs text-ink-500 uppercase font-bold">{c.label}</div>
            <div className="font-display font-black text-3xl text-ink-950 mt-1 group-hover:text-coral-500 transition">
              {isLoading ? '...' : c.value}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="font-display font-bold text-2xl text-ink-950 mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/owner/properties/new" className="card hover:shadow-lg transition group text-center py-5">
            <div className="text-3xl mb-2">+</div>
            <div className="font-bold text-sm">Add Property</div>
          </Link>
          <Link href="/owner/tenants/new" className="card hover:shadow-lg transition group text-center py-5">
            <div className="text-3xl mb-2">👤</div>
            <div className="font-bold text-sm">Add Tenant</div>
          </Link>
          <Link href="/owner/rent" className="card hover:shadow-lg transition group text-center py-5">
            <div className="text-3xl mb-2">📋</div>
            <div className="font-bold text-sm">Generate Bills</div>
          </Link>
          <Link href="/owner/agreements" className="card hover:shadow-lg transition group text-center py-5">
            <div className="text-3xl mb-2">📝</div>
            <div className="font-bold text-sm">New Agreement</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
