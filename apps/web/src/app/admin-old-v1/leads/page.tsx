'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';

export default function AdminLeads() {
  const [filter, setFilter] = useState({ status: '', source: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-leads', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.status) params.status = filter.status;
      if (filter.source) params.source = filter.source;
      return (await api.get('/admin/leads', { params })).data.data;
    },
  });

  return (
    <div>
      <h1 className="font-display font-black text-3xl text-ink-950 mb-1">Leads</h1>
      <p className="text-ink-700 mb-6">{data?.length || 0} total leads</p>

      <div className="card mb-5 p-4">
        <div className="grid grid-cols-2 gap-3">
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="input">
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="follow_up">Follow Up</option>
            <option value="visit_scheduled">Visit Scheduled</option>
            <option value="visit_done">Visit Done</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
            <option value="junk">Junk</option>
          </select>
          <select value={filter.source} onChange={(e) => setFilter({ ...filter, source: e.target.value })} className="input">
            <option value="">All Sources</option>
            <option value="website">Website</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="meta_ads">Meta Ads</option>
            <option value="google_ads">Google Ads</option>
            <option value="referral">Referral</option>
            <option value="walk_in">Walk-in</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : data?.length === 0 ? (
        <div className="card text-center py-10">
          <p className="font-bold">No leads</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-700 text-xs uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Property</th>
                  <th className="px-4 py-3 text-right">Budget</th>
                  <th className="px-4 py-3 text-center">Source</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((l: any) => (
                  <tr key={l.id} className="border-t border-ink-100 hover:bg-cream">
                    <td className="px-4 py-3 font-bold">{l.name}</td>
                    <td className="px-4 py-3">
                      <a href={`tel:${l.phone}`} className="hover:text-coral-500">{l.phone}</a>
                      {l.email && <div className="text-xs text-ink-500">{l.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">{l.property_name || '—'}</td>
                    <td className="px-4 py-3 text-right text-xs">
                      {l.budget_min ? `${formatINR(l.budget_min)} - ${formatINR(l.budget_max)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge bg-ink-100 text-ink-700 capitalize">{l.source?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge capitalize ${
                        l.status === 'new' ? 'bg-coral-100 text-coral-700' :
                        l.status === 'closed_won' ? 'bg-emerald-100 text-emerald-700' :
                        l.status === 'closed_lost' || l.status === 'junk' ? 'bg-ink-100 text-ink-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{l.status?.replace('_', ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
