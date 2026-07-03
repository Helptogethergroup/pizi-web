'use client';

import Link from 'next/link';
import { imageUrl, formatINR } from '@/lib/api';

export function PropertyCard({ property }: { property: any }) {
  const cover = imageUrl(property.cover_image);
  return (
    <Link href={`/property/${property.slug}`} className="group block rounded-2xl border border-ink-900/10 bg-white overflow-hidden hover:border-coral-500 hover:shadow-xl hover:shadow-ink-900/5 transition">
      <div className="aspect-[4/3] bg-cream relative overflow-hidden">
        {cover ? (
          <img src={cover} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-coral-50 to-cream">🏠</div>
        )}
        {property.is_verified == 1 && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-semibold text-emerald-700 flex items-center gap-1">
            ✓ Verified
          </span>
        )}
        {property.is_featured == 1 && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-coral-500 text-white text-xs font-semibold">⭐ Featured</span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-lg leading-tight group-hover:text-coral-600 transition">{property.name}</h3>
          <span className="text-xs px-2 py-1 rounded-md bg-ink-100 text-ink-700 capitalize whitespace-nowrap">{property.gender}</span>
        </div>

        <div className="text-sm text-ink-900/60 mt-1 truncate">
          📍 {property.locality?.name || property.locality_name}{property.city?.name ? `, ${property.city.name}` : property.city_name ? `, ${property.city_name}` : ''}
        </div>

        {(property.amenities || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {property.amenities.slice(0, 4).map((a: any) => (
              <span key={a.id} className="px-2 py-0.5 rounded-full bg-cream text-ink-700 text-xs flex items-center gap-1">
                <span>{a.icon || '✨'}</span>
                <span>{a.name}</span>
              </span>
            ))}
            {property.amenities.length > 4 && <span className="px-2 py-0.5 rounded-full bg-cream text-ink-700 text-xs">+{property.amenities.length - 4}</span>}
          </div>
        )}

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-xs text-ink-900/50">From</div>
            <div className="font-display font-black text-xl text-ink-950">{formatINR(property.rent_min)}<span className="text-sm font-medium text-ink-900/60">/mo</span></div>
          </div>
          <span className="text-coral-600 group-hover:translate-x-1 transition">→</span>
        </div>
      </div>
    </Link>
  );
}
