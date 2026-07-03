'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';

export default function SitemapPage() {
  const { data } = useQuery({
    queryKey: ['sitemap'],
    queryFn: async () => (await api.get('/public/sitemap')).data.data,
  });
  const cities = data?.cities || [];
  const localities = data?.localities || [];
  const properties = data?.properties || [];

  return (
    <PublicShell>
      <section className="max-w-6xl mx-auto px-4 lg:px-8 py-16">
        <h1 className="font-display font-black text-4xl">Sitemap</h1>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <div>
            <h2 className="font-display font-bold text-xl mb-4">Cities</h2>
            <ul className="space-y-2 text-sm">
              {cities.map((c: any) => <li key={c.id}><Link href={`/city/${c.slug}`} className="hover:text-coral-600">{c.name}</Link></li>)}
            </ul>
          </div>

          <div>
            <h2 className="font-display font-bold text-xl mb-4">Localities</h2>
            <ul className="space-y-2 text-sm">
              {localities.slice(0, 50).map((l: any) => <li key={l.id}><Link href={`/locality/${l.slug}`} className="hover:text-coral-600">{l.name}</Link></li>)}
            </ul>
          </div>

          <div>
            <h2 className="font-display font-bold text-xl mb-4">Pages</h2>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-coral-600">Home</Link></li>
              <li><Link href="/search" className="hover:text-coral-600">Browse PGs</Link></li>
              <li><Link href="/blog" className="hover:text-coral-600">Blog</Link></li>
              <li><Link href="/about" className="hover:text-coral-600">About</Link></li>
              <li><Link href="/contact" className="hover:text-coral-600">Contact</Link></li>
              <li><Link href="/landmarks" className="hover:text-coral-600">Landmarks</Link></li>
              <li><Link href="/register" className="hover:text-coral-600">List your PG</Link></li>
            </ul>
          </div>
        </div>

        {properties.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display font-bold text-xl mb-4">All Properties</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              {properties.map((p: any) => (
                <Link key={p.id} href={`/property/${p.slug}`} className="hover:text-coral-600 truncate">{p.name}</Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
