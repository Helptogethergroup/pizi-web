import Link from 'next/link';
import { formatINR, imageUrl } from '@/lib/api';

interface Property {
  id: number;
  name: string;
  slug: string;
  cover_image?: string;
  rent_min: number | string;
  rent_max: number | string;
  is_verified?: boolean | number;
  is_featured?: boolean | number;
  gender?: string;
  property_type?: string;
  city_name?: string;
  locality_name?: string;
  address_line?: string;
  total_rooms?: number;
  available_rooms?: number;
  view_count?: number;
  images?: { image_path: string }[];
}

export function PropertyCard({ p }: { p: Property }) {
  const cover = p.cover_image
    ? imageUrl(p.cover_image)
    : p.images?.[0]?.image_path
    ? imageUrl(p.images[0].image_path)
    : null;

  return (
    <Link href={`/property/${p.slug}`} className="card hover:shadow-xl transition group p-0 overflow-hidden">
      <div className="aspect-[4/3] bg-ink-100 relative overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🏠</div>
        )}

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {(p.is_verified == 1 || p.is_verified === true) && (
            <span className="badge-verified backdrop-blur bg-white/90">
              <span>✓</span> Verified
            </span>
          )}
          {(p.is_featured == 1 || p.is_featured === true) && (
            <span className="badge-featured backdrop-blur bg-white/90">⭐ Featured</span>
          )}
        </div>

        {/* Top-right gender */}
        {p.gender && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-white/90 text-ink-950 capitalize backdrop-blur">
              {p.gender === 'male' ? '👨 Boys' : p.gender === 'female' ? '👩 Girls' : '👥 Unisex'}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-display font-bold text-xl text-ink-950 group-hover:text-coral-500 transition leading-tight">
          {p.name}
        </h3>
        <p className="text-sm text-ink-700 mt-1.5 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
          </svg>
          {p.locality_name}{p.city_name ? `, ${p.city_name}` : ''}
        </p>

        <div className="flex items-end justify-between mt-4 pt-4 border-t border-ink-100">
          <div>
            <div className="text-xs text-ink-500 font-bold uppercase">Starts from</div>
            <div className="font-display font-black text-2xl text-coral-500">
              {formatINR(p.rent_min)}
              <span className="text-sm font-bold text-ink-700">/mo</span>
            </div>
          </div>
          {p.available_rooms !== undefined && (
            <div className="text-right">
              <div className="text-xs text-emerald-600 font-bold">{p.available_rooms} rooms</div>
              <div className="text-[10px] text-ink-500">available</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
