'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, formatINR, imageUrl } from '@/lib/api';

export default function OwnerProperties() {
  const { data, isLoading } = useQuery({
    queryKey: ['owner-properties'],
    queryFn: async () => (await api.get('/owner/properties')).data.data,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-ink-950">My Properties</h1>
          <p className="text-ink-700 mt-1">{data?.length || 0} properties listed</p>
        </div>
        <Link href="/owner/properties/new" className="btn-primary">+ Add Property</Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : data?.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🏠</div>
          <h3 className="font-display font-bold text-xl">No properties yet</h3>
          <p className="text-ink-700 mt-2">Add your first property to get started</p>
          <Link href="/owner/properties/new" className="btn-primary mt-4 inline-block">+ Add Property</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.map((p: any) => (
            <div key={p.id} className="card p-0 overflow-hidden hover:shadow-lg transition">
              <div className="aspect-[4/3] bg-ink-100 relative">
                {p.cover_image || p.images?.[0] ? (
                  <img
                    src={imageUrl(p.cover_image || p.images?.[0]?.image_path) || ''}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🏠</div>
                )}
                <div className="absolute top-3 right-3 flex gap-1">
                  {p.is_verified == 1 && <span className="badge-verified backdrop-blur bg-white/90">✓</span>}
                  {p.is_featured == 1 && <span className="badge-featured backdrop-blur bg-white/90">⭐</span>}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-ink-950">{p.name}</h3>
                <p className="text-xs text-ink-700 mt-1">📍 {p.locality_name}, {p.city_name}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-ink-500">Rooms</div>
                    <div className="font-bold">{p.total_rooms || 0}</div>
                  </div>
                  <div>
                    <div className="text-ink-500">From</div>
                    <div className="font-bold text-coral-500">{formatINR(p.rent_min)}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-ink-100 flex gap-2">
                  <Link href={`/property/${p.slug}`} target="_blank" className="btn-secondary text-xs flex-1 py-2">View Live</Link>
                  <Link href={`/owner/properties/${p.id}`} className="btn-primary text-xs flex-1 py-2">Edit</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
