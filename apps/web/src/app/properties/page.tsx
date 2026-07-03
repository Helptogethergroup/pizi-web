'use client';

import { PublicShell } from '@/components/public/PublicShell';
import { PropertyCard } from '@/components/public/PropertyCard';
import { useProperties } from '@/hooks/useProperties';

export default function PropertiesPage() {
  const { data: properties = [], isLoading, isError, refetch } = useProperties();

  return (
    <PublicShell>
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="font-display font-black text-3xl text-ink-950">All Properties</h1>
          <p className="text-ink-900/60 mt-1">
            {isLoading ? 'Loading properties…' : `Browse ${properties.length} PGs and hostels`}
          </p>
        </header>

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700 font-medium">Could not load properties.</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 rounded-lg bg-coral-500 text-white text-sm font-semibold hover:bg-coral-600 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-ink-900/10 bg-white overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-cream" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-cream rounded w-3/4" />
                  <div className="h-4 bg-cream rounded w-1/2" />
                  <div className="h-6 bg-cream rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 && !isError ? (
          <div className="text-center py-20 text-ink-900/60">No properties found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
