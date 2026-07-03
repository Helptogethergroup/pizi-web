'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';
import { PropertyCard } from '@/components/public/PropertyCard';

function SearchContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    q: sp.get('q') || '',
    city: sp.get('city') || '',
    gender: sp.get('gender') || '',
    budget_max: sp.get('budget_max') || '',
    type: sp.get('type') || '',
    amenities: sp.getAll('amenities[]') || [],
    sort: sp.get('sort') || 'latest',
  });

  useEffect(() => {
    setFilters({
      q: sp.get('q') || '',
      city: sp.get('city') || '',
      gender: sp.get('gender') || '',
      budget_max: sp.get('budget_max') || '',
      type: sp.get('type') || '',
      amenities: sp.getAll('amenities[]') || [],
      sort: sp.get('sort') || 'latest',
    });
  }, [sp]);

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => (await api.get('/cities')).data.data,
  });

  const { data: amenities } = useQuery({
    queryKey: ['amenities'],
    queryFn: async () => (await api.get('/amenities')).data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['search', filters],
    queryFn: async () => {
      // Map UI filter keys -> API param names. The API expects `property_type`
      // (not `type`) and ignores `sort`/`amenities` (handled client-side).
      const params: Record<string, any> = {};
      if (filters.q) params.q = filters.q;
      if (filters.city) params.city = filters.city;
      if (filters.gender) params.gender = filters.gender;
      if (filters.budget_max) params.budget_max = filters.budget_max;
      if (filters.type) params.property_type = filters.type;
      if (filters.amenities.length > 0) params['amenities[]'] = filters.amenities;
      return (await api.get('/public/search', { params })).data.data;
    },
  });

  const rawProperties = Array.isArray(data) ? data : (data?.properties || data?.data || []);

  // API doesn't sort, so sort client-side. rent_min may be a string like "8000.00".
  const properties = [...rawProperties].sort((a, b) => {
    const min = (p) => Number(p?.rent_min) || 0;
    if (filters.sort === 'price_low') return min(a) - min(b);
    if (filters.sort === 'price_high') return min(b) - min(a);
    return 0; // 'latest'/'popular' keep API order (already newest/featured first)
  });

  const apply = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.city) params.set('city', filters.city);
    if (filters.gender) params.set('gender', filters.gender);
    if (filters.budget_max) params.set('budget_max', filters.budget_max);
    if (filters.type) params.set('type', filters.type);
    if (filters.sort && filters.sort !== 'latest') params.set('sort', filters.sort);
    filters.amenities.forEach((a) => params.append('amenities[]', a));
    router.push(`/search?${params.toString()}`);
  };

  const clearAll = () => {
    setFilters({ q: '', city: '', gender: '', budget_max: '', type: '', amenities: [], sort: 'latest' });
    router.push('/search');
  };

  const toggleAmenity = (id) => {
    const idStr = String(id);
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(idStr)
        ? prev.amenities.filter((a) => a !== idStr)
        : [...prev.amenities, idStr],
    }));
  };

  const hasActiveFilters = filters.q || filters.city || filters.gender || filters.budget_max || filters.type || filters.amenities.length > 0;

  return (
    <PublicShell>
      <section className="bg-ink-950 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-black text-2xl lg:text-4xl text-cream mb-4">
            Browse {properties.length} verified PGs
          </h1>
          <form onSubmit={apply} className="bg-white rounded-2xl p-2 lg:p-3 flex flex-col lg:flex-row gap-2 max-w-4xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <span className="text-ink-400">🔍</span>
              <input
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="Search city, locality, or PG name..."
                className="flex-1 outline-none text-sm"
              />
            </div>
            <button type="submit" className="px-6 lg:px-8 py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold text-sm">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <aside className="lg:sticky lg:top-24 self-start">
              <div className="bg-white rounded-2xl border border-ink-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg">Filters</h3>
                  {hasActiveFilters && (
                    <button onClick={clearAll} className="text-xs text-coral-500 font-bold">Clear all</button>
                  )}
                </div>

                <form onSubmit={apply} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold uppercase text-ink-700 block mb-2">City</label>
                    <select
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm"
                    >
                      <option value="">All cities</option>
                      {cities?.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-ink-700 block mb-2">Looking for</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { val: 'male', label: '👨 Boys' },
                        { val: 'female', label: '👩 Girls' },
                        { val: 'unisex', label: '👥 Unisex' },
                      ].map((g) => (
                        <label key={g.val}>
                          <input
                            type="radio"
                            name="gender"
                            value={g.val}
                            checked={filters.gender === g.val}
                            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                            className="peer hidden"
                          />
                          <div className="text-center py-2 text-xs rounded-lg border border-ink-200 cursor-pointer peer-checked:bg-coral-500 peer-checked:text-white peer-checked:border-coral-500">
                            {g.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-ink-700 block mb-2">Max Budget (₹)</label>
                    <select
                      value={filters.budget_max}
                      onChange={(e) => setFilters({ ...filters, budget_max: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm"
                    >
                      <option value="">Any budget</option>
                      <option value="6000">Up to ₹6,000</option>
                      <option value="8000">Up to ₹8,000</option>
                      <option value="10000">Up to ₹10,000</option>
                      <option value="15000">Up to ₹15,000</option>
                      <option value="25000">Up to ₹25,000</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-ink-700 block mb-2">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm"
                    >
                      <option value="">All types</option>
                      <option value="pg">PG</option>
                      <option value="hostel">Hostel</option>
                      <option value="coliving">Coliving</option>
                      <option value="flatmate">Flatmate</option>
                    </select>
                  </div>

                  {amenities && amenities.length > 0 && (
                    <div>
                      <label className="text-xs font-bold uppercase text-ink-700 block mb-2">Amenities</label>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                        {amenities.map((a) => (
                          <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.amenities.includes(String(a.id))}
                              onChange={() => toggleAmenity(a.id)}
                              className="rounded text-coral-500"
                            />
                            <span className="text-sm text-ink-700">{a.icon || '✨'} {a.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <button type="submit" className="w-full py-2.5 bg-ink-950 text-cream rounded-xl font-bold text-sm hover:bg-ink-900 transition">
                    Apply filters
                  </button>
                </form>
              </div>
            </aside>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="text-sm text-ink-700">
                  <strong className="text-ink-950">{properties.length}</strong> properties found
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-ink-700">Sort:</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => {
                      const newFilters = { ...filters, sort: e.target.value };
                      setFilters(newFilters);
                      const params = new URLSearchParams();
                      if (newFilters.q) params.set('q', newFilters.q);
                      if (newFilters.city) params.set('city', newFilters.city);
                      if (newFilters.gender) params.set('gender', newFilters.gender);
                      if (newFilters.budget_max) params.set('budget_max', newFilters.budget_max);
                      if (newFilters.type) params.set('type', newFilters.type);
                      if (newFilters.sort !== 'latest') params.set('sort', newFilters.sort);
                      newFilters.amenities.forEach((a) => params.append('amenities[]', a));
                      router.push(`/search?${params.toString()}`);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-ink-200 text-xs"
                  >
                    <option value="latest">Newest first</option>
                    <option value="price_low">Price: Low to high</option>
                    <option value="price_high">Price: High to low</option>
                    <option value="popular">Most popular</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-20">Loading...</div>
              ) : properties.length === 0 ? (
                <div className="bg-white p-16 rounded-2xl border border-ink-100 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="font-display font-bold text-2xl text-ink-950">No PGs found</h3>
                  <p className="text-ink-600 mt-2">Try changing filters or search a different city.</p>
                  <button onClick={clearAll} className="inline-block mt-4 px-6 py-2.5 bg-coral-500 text-white rounded-xl font-bold text-sm">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<PublicShell><div className="text-center py-32 text-ink-900/60">Loading...</div></PublicShell>}>
      <SearchContent />
    </Suspense>
  );
}
