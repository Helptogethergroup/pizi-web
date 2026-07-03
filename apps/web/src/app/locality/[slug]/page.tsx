'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';
import { PropertyCard } from '@/components/public/PropertyCard';

export default function LocalityPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data, isLoading } = useQuery({
    queryKey: ['locality', slug],
    queryFn: async () => (await api.get(`/public/locality/${slug}`)).data.data,
  });

  if (isLoading) return <PublicShell><div className="text-center py-32 text-ink-900/60">Loading...</div></PublicShell>;
  const locality = data?.locality;
  if (!locality) return <PublicShell><div className="text-center py-32 text-ink-900/60">Locality not found</div></PublicShell>;

  const properties = data?.properties || [];
  const cityName = locality.city?.name || '';
  const citySlug = cityName.toLowerCase();

  return (
    <PublicShell>
      <section className="bg-cream grain border-b border-ink-900/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <nav className="text-sm text-ink-900/60 mb-3">
            <Link href="/" className="hover:text-coral-600">Home</Link> ›{' '}
            <Link href={`/city/${citySlug}`} className="hover:text-coral-600">PGs in {cityName}</Link> ›{' '}
            <span className="text-ink-900">{locality.name}</span>
          </nav>
          <span className="text-xs font-semibold text-coral-600 tracking-wider uppercase">{properties.length} PGs available</span>
          <h1 className="font-display font-black text-5xl md:text-6xl mt-3">PGs in <em className="text-coral-500 not-italic">{locality.name}</em></h1>
          <p className="mt-2 text-ink-900/60">{cityName}</p>
          {locality.description && <p className="mt-4 max-w-3xl text-lg text-ink-900/70 leading-relaxed">{locality.description}</p>}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <p className="text-center text-ink-900/60 py-20">No PGs listed in {locality.name} yet.</p>
        )}
      </section>
    </PublicShell>
  );
}
