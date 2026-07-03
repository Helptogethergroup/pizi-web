'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';
import { PropertyCard } from '@/components/public/PropertyCard';

export default function CityPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data, isLoading } = useQuery({
    queryKey: ['city', slug],
    queryFn: async () => (await api.get(`/public/city/${slug}`)).data.data,
  });

  if (isLoading) return <PublicShell><div className="text-center py-32 text-ink-900/60">Loading...</div></PublicShell>;
  const city = data?.city;
  if (!city) return <PublicShell><div className="text-center py-32 text-ink-900/60">City not found</div></PublicShell>;

  const properties = data?.properties || [];
  const localities = data?.localities || [];

  return (
    <PublicShell>
      <section className="bg-cream grain border-b border-ink-900/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <span className="text-xs font-semibold text-coral-600 tracking-wider uppercase">{properties.length} PGs available</span>
          <h1 className="font-display font-black text-5xl md:text-6xl mt-3">PGs in <em className="text-coral-500 not-italic">{city.name}</em></h1>
          {city.description && <p className="mt-4 max-w-3xl text-lg text-ink-900/70 leading-relaxed">{city.description}</p>}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {localities.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-4">Popular localities in {city.name}</h2>
            <div className="flex flex-wrap gap-2">
              {localities.map((loc: any) => (
                <Link key={loc.id} href={`/locality/${loc.slug}`} className="px-4 py-2 bg-white border border-ink-900/10 rounded-full text-sm font-medium hover:border-coral-500 hover:text-coral-600 transition">
                  {loc.name} <span className="text-ink-900/40">({loc.properties_count ?? 0})</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <p className="text-center text-ink-900/60 py-20">No PGs listed in {city.name} yet. Check back soon!</p>
        )}
      </section>
    </PublicShell>
  );
}
