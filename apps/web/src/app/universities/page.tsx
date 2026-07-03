'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';

export default function UniversitiesPage() {
  const { data: landmarks = [], isLoading } = useQuery({
    queryKey: ['landmarks'],
    queryFn: async () => (await api.get('/public/landmarks')).data.data,
  });

  const unis = (Array.isArray(landmarks) ? landmarks : []).filter(
    (l: any) => l.type === 'university' || l.type === 'college'
  );

  return (
    <PublicShell>
      <section className="bg-cream grain border-b border-ink-900/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <span className="text-xs font-semibold text-coral-600 uppercase tracking-wider">PGs near universities</span>
          <h1 className="font-display font-black text-5xl md:text-6xl mt-3">🎓 Find PGs near your campus.</h1>
          <p className="text-ink-900/70 mt-3 max-w-2xl text-lg">Browse verified PGs close to top universities and colleges across Delhi NCR.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        {isLoading ? (
          <div className="text-center py-20 text-ink-900/60">Loading...</div>
        ) : unis.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink-900/60">No universities added yet.</p>
            <Link href="/search" className="inline-block mt-4 px-6 py-2.5 bg-coral-500 text-white rounded-xl font-bold text-sm">Browse all PGs →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unis.map((l: any) => (
              <Link key={l.id} href={`/landmark/${l.slug}`} className="block p-5 bg-white rounded-2xl border border-ink-900/10 hover:border-coral-500 hover:shadow-lg transition">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{l.type_icon || '🎓'}</div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-lg leading-tight">{l.name}</div>
                    <div className="text-xs text-ink-900/60 mt-1">{l.city?.name || l.city_name || ''}</div>
                    <div className="text-xs text-coral-600 font-semibold mt-2">View PGs near here →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
