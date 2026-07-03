'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';
import { PropertyCard } from '@/components/public/PropertyCard';

export default function LandmarkPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data, isLoading } = useQuery({
    queryKey: ['landmark', slug],
    queryFn: async () => (await api.get(`/public/landmark/${slug}`)).data.data,
  });

  if (isLoading) return <PublicShell><div className="text-center py-32 text-ink-900/60">Loading...</div></PublicShell>;
  const landmark = data?.landmark;
  if (!landmark) return <PublicShell><div className="text-center py-32 text-ink-900/60">Landmark not found</div></PublicShell>;

  const properties = data?.properties || [];
  const cityName = landmark.city?.name || landmark.city_name || '';
  const citySlug = cityName.toLowerCase();

  return (
    <PublicShell>
      <section className="bg-cream grain border-b border-ink-900/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <nav className="text-sm text-ink-900/60 mb-3">
            <Link href="/" className="hover:text-coral-600">Home</Link> ›{' '}
            {cityName && <><Link href={`/city/${citySlug}`} className="hover:text-coral-600">{cityName}</Link> › </>}
            <span className="text-ink-900">{landmark.name}</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="text-6xl">{landmark.type_icon || '📍'}</div>
            <div className="flex-1">
              <span className="text-xs font-semibold text-coral-600 tracking-wider uppercase">{landmark.type_label || landmark.type || 'Landmark'}</span>
              <h1 className="font-display font-black text-4xl md:text-6xl mt-2 leading-tight">PG near<br /><em className="text-coral-500 not-italic">{landmark.name}</em></h1>
              <p className="text-ink-900/70 mt-3 text-lg">{properties.length} verified PGs nearby</p>
              {landmark.description && <p className="mt-4 max-w-3xl text-ink-900/70 leading-relaxed">{landmark.description}</p>}
            </div>
          </div>
        </div>
      </section>

      {landmark.latitude && landmark.longitude && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <iframe className="w-full h-80 rounded-2xl border-0" loading="lazy" src={`https://maps.google.com/maps?q=${landmark.latitude},${landmark.longitude}&z=14&output=embed`} />
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <h2 className="font-display font-bold text-3xl mb-8">Verified PGs near {landmark.name}</h2>
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <div className="text-center py-16"><p className="text-ink-900/60">No PGs registered near this landmark yet. Check back soon!</p></div>
        )}
      </section>
    </PublicShell>
  );
}
