'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function timeAgo(date: string) {
  if (!date) return '—';
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function SeoDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['seo-dashboard'],
    queryFn: async () => (await api.get('/seo/dashboard')).data.data,
  });

  const stats = data?.stats || { total_pages: 0, active_pages: 0, missing_meta: 0 };
  const recentSettings = data?.recent_settings || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">SEO Dashboard</h1>
        <p className="text-ink-900/60 mt-1">Manage SEO settings for all pages</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-ink-900/10">
          <div className="text-3xl mb-2">📄</div>
          <div className="text-xs text-ink-900/50 uppercase font-bold">Total Pages</div>
          <div className="font-display font-black text-3xl mt-1">{isLoading ? '...' : stats.total_pages}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-xs text-emerald-700 uppercase font-bold">Active Pages</div>
          <div className="font-display font-black text-3xl text-emerald-700 mt-1">{isLoading ? '...' : stats.active_pages}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-xs text-rose-700 uppercase font-bold">Missing Meta</div>
          <div className="font-display font-black text-3xl text-rose-700 mt-1">{isLoading ? '...' : stats.missing_meta}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display font-bold text-xl">Recently Updated</h2>
        <Link href="/seo/settings" className="text-coral-500 font-bold text-sm">View all →</Link>
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/10 divide-y divide-ink-900/10">
        {recentSettings.length === 0 ? (
          <div className="p-8 text-center text-ink-900/50">No SEO settings yet.</div>
        ) : (
          recentSettings.map((s: any) => (
            <div key={s.id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">{s.page_label}</h3>
                <p className="text-xs text-ink-900/50">{s.page_key} · Updated {s.updated_at && timeAgo(s.updated_at)}</p>
              </div>
              <Link href={`/seo/settings/${s.id}`} className="px-3 py-1.5 bg-coral-500 text-white rounded-lg text-sm font-bold">Edit</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
