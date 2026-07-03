'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, imageUrl, formatINR } from '@/lib/api';

export default function OwnerProperties() {
  const qc = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['owner-properties'],
    queryFn: async () => (await api.get('/owner/properties')).data.data,
  });

  const toggle = async (id: number) => {
    try {
      await api.patch(`/owner/properties/${id}/toggle`);
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['owner-properties'] });
    } catch { toast.error('Failed'); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this property?')) return;
    try {
      await api.delete(`/owner/properties/${id}`);
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['owner-properties'] });
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-black text-3xl">My properties</h1>
        <Link href="/owner/properties/new" className="px-4 py-2 bg-coral-500 text-white rounded-lg font-semibold">+ Add new</Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.length === 0 ? (
            <p className="col-span-3 text-center text-ink-900/50 py-20">
              No properties yet.{' '}
              <Link href="/owner/properties/new" className="text-coral-600 font-semibold">Add your first listing</Link>.
            </p>
          ) : (
            properties?.map((p: any) => (
              <div key={p.id} className="bg-white rounded-2xl border border-ink-900/10 overflow-hidden">
                <div className="aspect-[4/3] bg-ink-900/5">
                  {p.cover_image ? (
                    <img src={imageUrl(p.cover_image) || ''} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🏠</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {p.is_verified == 1 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">✓ Verified</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">Pending</span>
                    )}
                    {p.is_active == 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700">Inactive</span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg">{p.name}</h3>
                  <p className="text-sm text-ink-900/60">{p.locality_name || p.locality?.name}</p>
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <span className="font-bold">{formatINR(p.rent_min)} - {formatINR(p.rent_max)}</span>
                    <span className="text-ink-900/50">{p.view_count || 0} views · {p.lead_count || 0} leads</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Link href={`/owner/properties/${p.id}`} className="text-center text-xs py-2 rounded-lg bg-ink-900 text-cream font-semibold">Edit</Link>
                    <button onClick={() => toggle(p.id)} className="text-xs py-2 rounded-lg border border-ink-900/15 font-semibold">
                      {p.is_active == 1 ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={() => remove(p.id)} className="text-xs py-2 rounded-lg border border-rose-300 text-rose-600 font-semibold">Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
