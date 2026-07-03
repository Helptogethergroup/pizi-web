'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, formatINR } from '@/lib/api';

export default function AdminProperties() {
  const [filter, setFilter] = useState({ q: '', verified: '' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.q) params.q = filter.q;
      if (filter.verified) params.verified = filter.verified;
      return (await api.get('/admin/properties', { params })).data.data;
    },
  });

  const verify = async (id: number, verified: boolean) => {
    try {
      await api.patch(`/admin/properties/${id}/verify`, { verified });
      toast.success(verified ? 'Verified ✓' : 'Unverified');
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
    } catch { toast.error('Failed'); }
  };

  const feature = async (id: number, featured: boolean) => {
    try {
      await api.patch(`/admin/properties/${id}/feature`, { featured });
      toast.success(featured ? 'Featured ⭐' : 'Unfeatured');
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h1 className="font-display font-black text-3xl text-ink-950 mb-1">All Properties</h1>
      <p className="text-ink-700 mb-6">{data?.length || 0} properties on platform</p>

      <div className="card mb-5 p-4">
        <div className="grid grid-cols-2 gap-3">
          <input value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} placeholder="Search..." className="input" />
          <select value={filter.verified} onChange={(e) => setFilter({ ...filter, verified: e.target.value })} className="input">
            <option value="">All</option>
            <option value="1">Verified only</option>
            <option value="0">Unverified only</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-700 text-xs uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Property</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-right">Rent</th>
                  <th className="px-4 py-3 text-center">Verified</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((p: any) => (
                  <tr key={p.id} className="border-t border-ink-100 hover:bg-cream">
                    <td className="px-4 py-3 font-bold">{p.name}</td>
                    <td className="px-4 py-3 text-xs">{p.owner_name || '—'}<br /><span className="text-ink-500">{p.owner_phone}</span></td>
                    <td className="px-4 py-3 text-xs">{p.locality_name}, {p.city_name}</td>
                    <td className="px-4 py-3 text-right font-bold text-coral-500">{formatINR(p.rent_min)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => verify(p.id, p.is_verified != 1)} className={`text-xs px-3 py-1 rounded font-bold ${
                        p.is_verified == 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-700 hover:bg-emerald-100'
                      }`}>
                        {p.is_verified == 1 ? '✓ Verified' : 'Verify'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => feature(p.id, p.is_featured != 1)} className={`text-xs px-3 py-1 rounded font-bold ${
                        p.is_featured == 1 ? 'bg-amber-100 text-amber-700' : 'bg-ink-100 text-ink-700 hover:bg-amber-100'
                      }`}>
                        {p.is_featured == 1 ? '⭐ Featured' : 'Feature'}
                      </button>
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
