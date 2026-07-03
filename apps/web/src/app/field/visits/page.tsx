'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function FieldVisitsIndex() {
  const [status, setStatus] = useState('all');

  const { data: visits, isLoading } = useQuery({
    queryKey: ['field-visits', status],
    queryFn: async () => {
      const params: any = {};
      if (status !== 'all') params.status = status;
      return (await api.get('/field/visits', { params })).data.data;
    },
  });

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'scheduled', label: '📅 Scheduled' },
    { key: 'in_progress', label: '⏳ In Progress' },
    { key: 'completed', label: '✅ Completed' },
    { key: 'cancelled', label: '❌ Cancelled' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">My Visits</h1>
        <p className="text-ink-900/60 mt-1">All your assigned property visits</p>
      </div>

      <div className="bg-white rounded-xl border border-ink-900/10 p-2 mb-4 flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${
              status === t.key ? 'bg-coral-500 text-white' : 'text-ink-900/70 hover:bg-cream'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (visits || []).length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-ink-900/70">No visits found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits?.map((v: any) => (
            <Link key={v.id} href={`/field/visits/${v.id}`} className="block bg-white p-5 rounded-2xl border border-ink-900/10 hover:border-coral-500 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                      v.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      v.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                      v.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {v.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg">{v.property?.name || v.property_name}</h3>
                  <p className="text-sm text-ink-900/70 mt-1">📍 {v.property?.address_line || v.address_line}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ink-900/50 uppercase">When</div>
                  <div className="font-bold">{v.scheduled_at && new Date(v.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
