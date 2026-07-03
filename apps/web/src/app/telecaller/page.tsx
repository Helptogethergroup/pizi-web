'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

function statusBadge(status: string) {
  const map: any = {
    new: 'bg-coral-50 text-coral-900',
    contacted: 'bg-sky-100 text-sky-900',
    interested: 'bg-violet-100 text-violet-900',
    follow_up: 'bg-amber-100 text-amber-900',
    visit_scheduled: 'bg-sky-100 text-sky-900',
    visit_done: 'bg-emerald-100 text-emerald-900',
    closed_won: 'bg-emerald-200 text-emerald-900',
    closed_lost: 'bg-rose-100 text-rose-900',
  };
  return map[status] || 'bg-ink-900/10 text-ink-900/60';
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
}

export default function TelecallerDashboard() {
  const user = useAuth((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['telecaller-dashboard'],
    queryFn: async () => (await api.get('/telecaller/dashboard')).data.data,
  });

  const stats = data?.stats || { total_assigned: 0, new: 0, follow_ups_today: 0, closed_won: 0 };
  const newLeads = data?.new_leads || [];
  const todaysFollowUps = data?.todays_follow_ups || [];

  const cards = [
    { label: 'Total assigned', value: stats.total_assigned, cls: 'bg-ink-900 text-cream' },
    { label: 'New (uncontacted)', value: stats.new, cls: 'bg-coral-500 text-white' },
    { label: 'Follow-ups today', value: stats.follow_ups_today, cls: 'bg-amber-100 text-amber-900' },
    { label: 'Closed (won)', value: stats.closed_won, cls: 'bg-emerald-100 text-emerald-900' },
  ];

  return (
    <div>
      <h1 className="font-display font-black text-4xl">Hi, {user?.name}.</h1>
      <p className="text-ink-900/60">Your sales engine for today.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {cards.map((c) => (
          <div key={c.label} className={`p-5 rounded-2xl ${c.cls}`}>
            <div className="text-xs uppercase tracking-wide opacity-70">{c.label}</div>
            <div className="font-display font-black text-3xl mt-2">{isLoading ? '...' : c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <div className="bg-white p-6 rounded-2xl border border-ink-900/10">
          <h2 className="font-display font-bold text-xl mb-4">🔥 New leads — call now</h2>
          {newLeads.length === 0 ? (
            <p className="text-ink-900/50 text-sm py-6 text-center">No new leads. Great hustle!</p>
          ) : (
            newLeads.map((lead: any) => (
              <Link key={lead.id} href={`/telecaller/leads/${lead.id}`} className="flex items-center justify-between py-3 border-t border-ink-900/5 first:border-t-0 hover:bg-ink-900/5 px-2 rounded">
                <div>
                  <div className="font-semibold">{lead.name}</div>
                  <div className="text-xs text-ink-900/50">📞 {lead.phone} · {lead.property?.name || 'General'}</div>
                </div>
                <div className="text-xs text-ink-900/40">{lead.created_at && timeAgo(lead.created_at)}</div>
              </Link>
            ))
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-ink-900/10">
          <h2 className="font-display font-bold text-xl mb-4">📅 Follow-ups today</h2>
          {todaysFollowUps.length === 0 ? (
            <p className="text-ink-900/50 text-sm py-6 text-center">No follow-ups scheduled today.</p>
          ) : (
            todaysFollowUps.map((lead: any) => (
              <Link key={lead.id} href={`/telecaller/leads/${lead.id}`} className="flex items-center justify-between py-3 border-t border-ink-900/5 first:border-t-0 hover:bg-ink-900/5 px-2 rounded">
                <div>
                  <div className="font-semibold">{lead.name}</div>
                  <div className="text-xs text-ink-900/50">📞 {lead.phone}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${statusBadge(lead.status)}`}>
                  {lead.status?.replace('_', ' ')}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
