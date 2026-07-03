'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api, formatINR } from '@/lib/api';

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
    junk: 'bg-ink-900/10 text-ink-900/60',
  };
  return map[status] || 'bg-ink-900/10 text-ink-900/60';
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 2592000)} months ago`;
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data.data,
  });

  const stats = data?.stats || {};
  const recentLeads = data?.recent_leads || [];
  const unmatchedLeads = data?.unmatched_leads || [];

  // Calculate conversion %
  const conversion = stats.total_leads
    ? Math.round((stats.closed_won || 0) / stats.total_leads * 100)
    : 0;

  // Leads by status
  const leadsByStatus: any = {};
  recentLeads.forEach((l: any) => {
    leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1;
  });

  // EXACT Laravel card structure
  const cards = [
    { label: 'Total properties', value: stats.total_properties || 0, cls: 'bg-ink-900 text-cream' },
    { label: 'Active', value: stats.verified_properties || stats.active_properties || 0, cls: 'bg-emerald-100 text-emerald-900' },
    { label: 'Pending verification', value: stats.pending_verification ?? ((stats.total_properties || 0) - (stats.verified_properties || 0)), cls: 'bg-amber-100 text-amber-900' },
    { label: 'Total leads', value: (stats.total_leads || 0).toLocaleString(), cls: 'bg-coral-50 text-coral-900' },
    { label: 'New leads', value: stats.new_leads || 0, cls: 'bg-sky-100 text-sky-900' },
    { label: 'Closed (won)', value: stats.closed_won || 0, cls: 'bg-emerald-200 text-emerald-900' },
    { label: 'Conversion %', value: conversion + '%', cls: 'bg-violet-100 text-violet-900' },
    { label: 'Active telecallers', value: stats.telecallers || 1, cls: 'bg-cream text-ink-900 border border-ink-900/10' },
  ];

  return (
    <div>
      <h1 className="font-display font-black text-4xl mb-2">Admin Dashboard</h1>
      <p className="text-ink-900/60">Overview of your business at a glance.</p>

      {/* Stats Grid - EXACT Laravel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {cards.map((c) => (
          <div key={c.label} className={`p-5 rounded-2xl ${c.cls}`}>
            <div className="text-xs uppercase tracking-wide opacity-70">{c.label}</div>
            <div className="font-display font-black text-3xl mt-2">{isLoading ? '...' : c.value}</div>
          </div>
        ))}
      </div>

      {/* Lead Routing Engine - EXACT Laravel */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-ink-900 to-ink-950 text-cream">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-coral-400">🎯 Lead Routing Engine</div>
            <h2 className="font-display font-bold text-2xl mt-1">Smart matching is active</h2>
            <p className="text-cream/70 text-sm mt-2">
              Every lead is auto-scored against owners' properties using location (40%), budget (30%), gender (20%), and availability (10%).
              Owners see leads sorted by relevance, not chronology.
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl">🤖</div>
          </div>
        </div>
      </div>

      {/* Leads by status + Recent leads - EXACT Laravel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div className="bg-white p-6 rounded-2xl border border-ink-900/10">
          <h2 className="font-display font-bold text-xl mb-4">Leads by status</h2>
          <div className="space-y-2">
            {Object.keys(leadsByStatus).length === 0 ? (
              <p className="text-ink-900/50 text-sm">No data</p>
            ) : (
              Object.entries(leadsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center text-sm">
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                  <span className="font-bold">{count as any}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-ink-900/10">
          <h2 className="font-display font-bold text-xl mb-4">Recent leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-900/60 text-xs uppercase">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Property</th>
                  <th>Status</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.slice(0, 7).map((lead: any) => (
                  <tr key={lead.id} className="border-t border-ink-900/5">
                    <td className="py-3">
                      <div className="font-semibold">{lead.name}</div>
                      <div className="text-xs text-ink-900/50">{lead.phone}</div>
                    </td>
                    <td>{lead.property?.name || lead.property_name || '—'}</td>
                    <td>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusBadge(lead.status)}`}>
                        {lead.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-ink-900/60 text-xs">{lead.created_at && timeAgo(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/admin/leads" className="inline-block mt-4 text-coral-600 font-semibold text-sm">View all →</Link>
        </div>
      </div>

      {/* Unmatched leads - EXACT Laravel */}
      {unmatchedLeads.length > 0 && (
        <div className="mt-10 p-6 rounded-2xl bg-amber-50 border-2 border-amber-200">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div className="flex-1">
              <h2 className="font-display font-bold text-xl text-amber-900">
                {unmatchedLeads.length} unmatched leads (last 7 days)
              </h2>
              <p className="text-sm text-amber-900/80 mt-1">
                These leads couldn't find a good property match. Opportunity to onboard new PG owners in these locations!
              </p>

              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {unmatchedLeads.slice(0, 10).map((lead: any) => (
                  <div key={lead.id} className="bg-white px-4 py-3 rounded-lg flex items-center justify-between text-sm">
                    <div>
                      <div className="font-semibold">{lead.name}</div>
                      <div className="text-xs text-ink-900/60">
                        📍 {lead.preferred_locality || '—'}{lead.preferred_city ? `, ${lead.preferred_city}` : ''}
                        {' · 💰 '}{formatINR(lead.budget_max || 0)}
                        {' · '}{(lead.preferred_gender || 'any').charAt(0).toUpperCase() + (lead.preferred_gender || 'any').slice(1)}
                      </div>
                    </div>
                    <span className="text-xs text-ink-900/50">{lead.created_at && timeAgo(lead.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
