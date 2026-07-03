'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, formatINR, imageUrl } from '@/lib/api';

export default function AdminProperties() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['admin-properties', filter, search],
    queryFn: async () => {
      const params: any = {};
      if (filter && filter !== 'all') params.filter = filter;
      if (search) params.q = search;
      return (await api.get('/admin/properties', { params })).data.data;
    },
  });

  const { data: owners } = useQuery({
    queryKey: ['admin-owners'],
    queryFn: async () => (await api.get('/admin/users', { params: { role: 'owner' } })).data.data,
  });

  const action = async (id: number, endpoint: string, body?: any) => {
    try {
      await api.patch(`/admin/properties/${id}/${endpoint}`, body);
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
    } catch { toast.error('Failed'); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this property?')) return;
    try {
      await api.delete(`/admin/properties/${id}`);
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
    } catch { toast.error('Failed'); }
  };

  const filterTabs = [
    { key: 'all', label: '📋 All Properties' },
    { key: 'my', label: '🏠 My PGs (Admin)' },
    { key: 'owners', label: "👤 Owners' PGs" },
    { key: 'unassigned', label: '⚠️ Unassigned' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">All Properties</h1>
          <p className="text-ink-900/60 mt-1">Manage all PGs on the platform</p>
        </div>
        <Link href="/admin/properties/new" className="inline-flex items-center gap-2 px-5 py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold transition shadow-lg shadow-coral-500/30">
          + Add New Property
        </Link>
      </div>

      {/* Filter Tabs - EXACT Laravel */}
      <div className="bg-white rounded-xl border border-ink-900/10 p-2 mb-4 flex gap-1 overflow-x-auto">
        {filterTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${
              filter === t.key ? 'bg-coral-500 text-white' : 'text-ink-900/70 hover:bg-cream'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search property name..."
          className="flex-1 px-4 py-3 rounded-xl border border-ink-900/15"
        />
        <button className="px-5 py-3 bg-ink-950 text-cream rounded-xl font-bold">Search</button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : properties?.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-ink-900/70">No properties found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties?.map((p: any) => (
            <div key={p.id} className="bg-white p-4 rounded-2xl border border-ink-900/10">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Cover image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream flex-shrink-0">
                  {p.cover_image ? (
                    <img src={imageUrl(p.cover_image) || ''} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {p.is_verified == 1 && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">✓ Verified</span>
                    )}
                    {p.is_featured == 1 && (
                      <span className="text-xs bg-coral-500 text-white px-2 py-0.5 rounded-full font-bold">⭐ Featured</span>
                    )}
                    {p.is_active == 0 && (
                      <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">⏸ Paused</span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-base">{p.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-ink-900/70 mt-0.5 flex-wrap">
                    <span>📍 {p.locality_name}, {p.city_name}</span>
                    <span className="font-bold text-coral-600">{formatINR(p.rent_min)} - {formatINR(p.rent_max)}</span>
                  </div>

                  {/* Owner assign */}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <label className="text-xs font-bold text-ink-900/50 uppercase">Owner:</label>
                    <select
                      defaultValue={p.owner_id || ''}
                      onChange={(e) => action(p.id, 'assign', { owner_id: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-ink-900/15 text-xs font-bold bg-white"
                    >
                      <option value="">— Unassigned —</option>
                      {owners?.map((o: any) => (
                        <option key={o.id} value={o.id}>👤 {o.name} {o.phone ? `(${o.phone})` : ''}</option>
                      ))}
                    </select>
                    {!p.owner_id && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">⚠️ No owner</span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link href={`/property/${p.slug}`} target="_blank" className="px-3 py-2 bg-ink-100 hover:bg-ink-200 text-ink-950 rounded-lg text-xs font-bold">
                    👁 View
                  </Link>
                  <Link href={`/owner/properties/${p.id}`} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold">
                    ✏ Edit
                  </Link>
                  <button
                    onClick={() => action(p.id, 'verify', { verified: p.is_verified != 1 })}
                    className={`px-3 py-2 ${p.is_verified == 1 ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white rounded-lg text-xs font-bold`}
                  >
                    {p.is_verified == 1 ? '↺ Unverify' : '✓ Verify'}
                  </button>
                  <button
                    onClick={() => action(p.id, 'feature', { featured: p.is_featured != 1 })}
                    className={`px-3 py-2 ${p.is_featured == 1 ? 'bg-slate-600 hover:bg-slate-700' : 'bg-coral-500 hover:bg-coral-600'} text-white rounded-lg text-xs font-bold`}
                  >
                    {p.is_featured == 1 ? '★ Unfeature' : '⭐ Feature'}
                  </button>
                  <button
                    onClick={() => action(p.id, 'toggle')}
                    className={`px-3 py-2 ${p.is_active == 1 ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white rounded-lg text-xs font-bold`}
                  >
                    {p.is_active == 1 ? '⏸ Pause' : '▶ Activate'}
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
