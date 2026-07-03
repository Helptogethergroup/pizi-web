'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
}

export default function OwnerDashboard() {
  const user = useAuth((s) => s.user);

  const { data: dash, isLoading } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: async () => (await api.get('/owner/dashboard')).data.data,
  });

  const { data: properties } = useQuery({
    queryKey: ['owner-properties'],
    queryFn: async () => (await api.get('/owner/properties')).data.data,
  });

  const stats = dash?.stats || {};
  const recentLeads = dash?.recent_leads || [];

  const totalViews = (properties || []).reduce((s: number, p: any) => s + (parseInt(p.view_count) || 0), 0);
  const totalLeads = stats.total_leads || 0;
  const activeCount = (properties || []).filter((p: any) => p.is_verified == 1).length || properties?.length || 0;

  // EXACT Laravel card structure
  const cards = [
    { label: 'Total properties', value: stats.properties ?? (properties?.length || 0), cls: 'bg-ink-900 text-cream' },
    { label: 'Active', value: stats.active ?? activeCount, cls: 'bg-emerald-100 text-emerald-900' },
    { label: 'Total views', value: (stats.total_views ?? totalViews).toLocaleString(), cls: 'bg-coral-50 text-coral-900' },
    { label: 'Total leads', value: totalLeads, cls: 'bg-violet-100 text-violet-900' },
  ];

  return (
    <div>
      <h1 className="font-display font-black text-4xl">Welcome, {user?.name}.</h1>
      <p className="text-ink-900/60">Here's how your listings are doing.</p>

      {/* Stats Grid - EXACT Laravel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {cards.map((c) => (
          <div key={c.label} className={`p-5 rounded-2xl ${c.cls}`}>
            <div className="text-xs uppercase tracking-wide opacity-70">{c.label}</div>
            <div className="font-display font-black text-3xl mt-2">{isLoading ? '...' : c.value}</div>
          </div>
        ))}
      </div>

      {/* Your properties + Recent leads - EXACT Laravel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-ink-900/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold text-xl">Your properties</h2>
            <Link href="/owner/properties/new" className="px-4 py-2 bg-coral-500 text-white rounded-lg font-semibold text-sm">+ Add new</Link>
          </div>
          {properties?.length === 0 ? (
            <p className="text-ink-900/50 text-center py-12">
              No properties yet.{' '}
              <Link href="/owner/properties/new" className="text-coral-600 font-semibold">Add your first one</Link>.
            </p>
          ) : (
            properties?.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-t border-ink-900/5">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-ink-900/50">{p.locality_name || p.locality?.name} · {p.view_count || 0} views</div>
                </div>
                <Link href={`/owner/properties/${p.id}`} className="text-coral-600 text-sm font-semibold">Edit →</Link>
              </div>
            ))
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-ink-900/10">
          <h2 className="font-display font-bold text-xl mb-4">Recent leads</h2>
          {recentLeads.length === 0 ? (
            <p className="text-ink-900/50 text-sm">No leads yet.</p>
          ) : (
            recentLeads.map((lead: any) => (
              <div key={lead.id} className="py-2 border-t border-ink-900/5 first:border-t-0">
                <div className="font-semibold text-sm">{lead.name}</div>
                <div className="text-xs text-ink-900/50">📞 {lead.phone} · {lead.property?.name || lead.property_name || ''}</div>
                <div className="text-xs text-ink-900/40 mt-1">{lead.created_at && timeAgo(lead.created_at)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
