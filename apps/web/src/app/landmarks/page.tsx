'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';

const TYPE_NAMES: Record<string, string> = {
  university: '🎓 Universities & Colleges',
  college: '🎓 Colleges',
  office: '🏢 IT Parks & Offices',
  hospital: '🏥 Hospitals',
  metro: '🚇 Metro Stations',
  mall: '🛍️ Malls',
  airport: '✈️ Airports',
  railway: '🚆 Railway Stations',
};

export default function LandmarksPage() {
  const { data: landmarks = [], isLoading } = useQuery({
    queryKey: ['landmarks'],
    queryFn: async () => (await api.get('/public/landmarks')).data.data,
  });

  // Group by type (API returns a flat list)
  const grouped: Record<string, any[]> = {};
  (Array.isArray(landmarks) ? landmarks : []).forEach((l: any) => {
    const t = l.type || 'other';
    (grouped[t] = grouped[t] || []).push(l);
  });
  const types = Object.keys(grouped);

  return (
    <PublicShell>
      <section className="bg-cream grain border-b border-ink-900/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <span className="text-xs font-semibold text-coral-600 uppercase tracking-wider">PGs near landmarks</span>
          <h1 className="font-display font-black text-5xl md:text-6xl mt-3">Find PGs by what&apos;s around.</h1>
          <p className="text-ink-900/70 mt-3 max-w-2xl text-lg">Browse verified PGs sorted by their distance from the universities, IT parks, hospitals, and metros that matter to you.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        {isLoading ? (
          <div className="text-center py-20 text-ink-900/60">Loading...</div>
        ) : types.length === 0 ? (
          <p className="text-center text-ink-900/60 py-20">No landmarks added yet. Check back soon!</p>
        ) : types.map((type) => (
          <div key={type} className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6">{TYPE_NAMES[type] || type}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[type].map((l: any) => (
                <Link key={l.id} href={`/landmark/${l.slug}`} className="block p-5 bg-white rounded-2xl border border-ink-900/10 hover:border-coral-500 hover:shadow-lg transition">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{l.type_icon || '📍'}</div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-lg leading-tight">{l.name}</div>
                      <div className="text-xs text-ink-900/60 mt-1">{l.city?.name || l.city_name || ''}</div>
                      <div className="text-xs text-coral-600 font-semibold mt-2">View PGs near here →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </PublicShell>
  );
}
