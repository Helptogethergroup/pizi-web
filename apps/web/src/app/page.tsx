'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, imageUrl } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';
import { PropertyCard } from '@/components/public/PropertyCard';

const IMG = 'https://pizi.in/assets/images';

const BUDGETS: Array<[string, string, string, string]> = [
  ['budget-6000rs-img.jpeg', 'Under ₹6,000', '6000', 'Best for students'],
  ['budget-8000rs-img.jpeg', 'Under ₹8,000', '8000', 'Popular choice'],
  ['budget-10000rs-img.jpeg', 'Under ₹10,000', '10000', 'Comfort stays'],
  ['budget-15000rs-img.jpeg', 'Under ₹15,000', '15000', 'Premium PGs'],
];
const TYPES: Array<[string, string, string, string]> = [
  ['boys-img.jpeg', 'Boys PG', 'PGs for men', 'male'],
  ['girls-img.jpeg', 'Girls PG', 'PGs for women', 'female'],
  ['unisex-img.jpeg', 'Unisex PG', 'Co-living spaces', 'unisex'],
];
const CITY_TILES: Array<[string, string, string]> = [
  ['Delhi', 'delhi', 'delhi-img.jpeg'],
  ['Noida', 'noida', 'noida-img.jpeg'],
  ['Gurgaon', 'gurgaon', 'gurgaon-img.jpeg'],
  ['Ghaziabad', 'ghaziabad', 'ghaziabad-img.jpeg'],
  ['Faridabad', 'faridabad', 'faridabad-img.jpeg'],
];
const FEATURES: Array<[string, string, string]> = [
  ['bed-sharing-img.jpeg', 'Bed Sharing', 'From single occupancy to 4-sharing rooms — pick the option that fits your budget and comfort.'],
  ['food-img.jpeg', 'Food Included', 'Hygienic kitchens, branded groceries and home-style meals. Most PGs come with food included.'],
  ['wifi-img.jpeg', 'High-Speed WiFi', 'Free high-speed WiFi across the entire premises — stay connected for work or entertainment.'],
  ['power-backup-img.jpeg', 'Power Backup', '24x7 power backup. Even during outages, your fans, lights and WiFi keep running — no worries.'],
  ['no-maintenance-img.jpeg', 'Zero Maintenance', 'Cleaning, repairs and upkeep are all handled by us. Just relax — we take care of the rest.'],
  ['verified-img.jpeg', 'Verified & Safe', 'Every PG is physically inspected by our field team. CCTV, security and safe localities guaranteed.'],
];
const STEPS: Array<[string, string, string, string]> = [
  ['1', 'Search', 'Browse verified PGs in your preferred locality and budget.', 'search-img.jpeg'],
  ['2', 'Visit', 'Schedule a free site visit. Our field team accompanies you.', 'visit-img.jpeg'],
  ['3', 'Move in', 'Pay token, sign agreement, and move into your new home.', 'book-img.jpeg'],
];

export default function HomePage() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ['public-home'],
    queryFn: async () => (await api.get('/public/home')).data.data,
  });

  const [q, setQ] = useState('');
  const [gender, setGender] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  const stats = data?.stats || { properties: 500, cities: 4, tenants: '12,000' };
  const featured = data?.featured || [];
  const cities = data?.cities || [];
  const recentBlogs = data?.recent_blogs || [];

  // Scroll reveal (matches Laravel .pz-reveal behavior)
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.pz-reveal'));
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach((el) => el.classList.add('pz-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('pz-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (gender) params.set('gender', gender);
    if (budgetMax) params.set('budget_max', budgetMax);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <PublicShell>
      <style>{`
        @keyframes piziFadeUp { from { opacity:0; transform: translateY(34px);} to {opacity:1; transform: translateY(0);} }
        @keyframes piziFloat  { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-16px);} }
        @keyframes piziFloat2 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-22px);} }
        @keyframes piziBlob   { 0%{transform:translate(0,0) scale(1);} 33%{transform:translate(40px,-30px) scale(1.15);} 66%{transform:translate(-30px,25px) scale(.9);} 100%{transform:translate(0,0) scale(1);} }
        @keyframes piziBlob2  { 0%{transform:translate(0,0) scale(1);} 50%{transform:translate(-50px,40px) scale(1.2);} 100%{transform:translate(0,0) scale(1);} }
        @keyframes piziPulse  { 0%,100%{opacity:.5;} 50%{opacity:1;} }
        .pz-anim{opacity:0;animation:piziFadeUp .8s cubic-bezier(.16,1,.3,1) forwards;}
        .pz-d1{animation-delay:.05s;} .pz-d2{animation-delay:.18s;} .pz-d3{animation-delay:.32s;}
        .pz-d4{animation-delay:.46s;} .pz-d5{animation-delay:.60s;} .pz-d6{animation-delay:.74s;}
        .pz-float{animation:piziFloat 5s ease-in-out infinite;}
        .pz-float2{animation:piziFloat2 6.5s ease-in-out infinite;}
        .pz-float-slow{animation:piziFloat 8s ease-in-out infinite;}
        .pz-blob{animation:piziBlob 18s ease-in-out infinite;}
        .pz-blob2{animation:piziBlob2 22s ease-in-out infinite;}
        .pz-reveal{opacity:0;transform:translateY(48px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1);}
        .pz-reveal.pz-in{opacity:1;transform:translateY(0);}
        .grain{background-image:radial-gradient(rgba(15,39,72,0.04) 1px,transparent 1px);background-size:16px 16px;}
      `}</style>

      {/* HERO */}
      <section className="relative grain overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=80')" }} />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-cream/85 backdrop-blur-[1px]" />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="pz-blob absolute -top-24 -left-20 w-[28rem] h-[28rem] bg-coral-500/15 rounded-full blur-3xl" />
          <div className="pz-blob2 absolute top-1/3 -right-24 w-[32rem] h-[32rem] bg-coral-400/10 rounded-full blur-3xl" />
          <div className="pz-blob absolute bottom-0 left-1/3 w-80 h-80 bg-ink-900/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            <div>
              <span className="pz-anim pz-d1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-50 text-coral-700 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-coral-500" style={{ animation: 'piziPulse 1.6s ease-in-out infinite' }} />
                Verified by Pizi field team
              </span>
              <h1 className="pz-anim pz-d2 font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] font-black text-ink-950">
                Find your PG that <span className="italic text-coral-600">feels like home.</span>
              </h1>
              <p className="pz-anim pz-d3 text-lg text-ink-900/70 mt-6 max-w-xl leading-relaxed">
                Verified listings, real photos, honest rents. Across Delhi, Noida, Gurgaon &amp; Ghaziabad — book a free site visit in 60 seconds.
              </p>

              <form onSubmit={search} className="pz-anim pz-d4 mt-8 bg-white shadow-xl shadow-ink-900/5 rounded-2xl p-3 flex flex-wrap gap-2 w-full max-w-5xl">
                <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Locality, college, metro station..." className="flex-1 min-w-[150px] px-4 py-2.5 text-sm border border-ink-900/10 rounded-xl focus:outline-none focus:border-coral-500 placeholder:text-ink-900/40" />
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="px-4 py-2.5 text-sm border border-ink-900/10 rounded-xl bg-cream">
                  <option value="">Any gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unisex">Unisex</option>
                </select>
                <select value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="px-4 py-2.5 text-sm border border-ink-900/10 rounded-xl bg-cream">
                  <option value="">Budget</option>
                  <option value="6000">Under ₹6k</option>
                  <option value="10000">Under ₹10k</option>
                  <option value="15000">Under ₹15k</option>
                  <option value="25000">Under ₹25k</option>
                </select>
                <button type="submit" className="px-6 py-2.5 bg-coral-500 hover:bg-coral-600 text-white font-bold text-sm rounded-xl transition shadow-coral-500/30 whitespace-nowrap">Search →</button>
              </form>

              <div className="pz-anim pz-d6 mt-12 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
                <div className="bg-white/60 rounded-2xl border border-ink-900/5 p-4 text-center sm:text-left">
                  <div className="font-display font-black text-2xl sm:text-3xl text-ink-950">{stats.properties}+</div>
                  <div className="text-xs text-ink-900/60 mt-1">Verified PGs</div>
                </div>
                <div className="bg-white/60 rounded-2xl border border-ink-900/5 p-4 text-center sm:text-left">
                  <div className="font-display font-black text-2xl sm:text-3xl text-ink-950">{stats.cities}</div>
                  <div className="text-xs text-ink-900/60 mt-1">Cities</div>
                </div>
                <div className="bg-white/60 rounded-2xl border border-ink-900/5 p-4 text-center sm:text-left">
                  <div className="font-display font-black text-2xl sm:text-3xl text-ink-950">{stats.tenants}+</div>
                  <div className="text-xs text-ink-900/60 mt-1">Happy Residents</div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:flex items-stretch self-stretch pz-anim pz-d3">
              <div className="pz-float relative rounded-3xl overflow-hidden shadow-2xl shadow-ink-900/20 w-full flex">
                <img src={`${IMG}/pizi-img.jpeg`} alt="Modern PG room" className="w-full h-full min-h-[460px] object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                  Verified Property
                </div>
              </div>
              <div className="pz-float2 absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-2xl shadow-ink-900/15 px-4 py-3 flex items-center gap-3 max-w-[240px]">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">✓</div>
                <div><div className="font-semibold text-sm">Free site visit</div><div className="text-xs text-ink-900/60">Our team accompanies you</div></div>
              </div>
              <div className="pz-float-slow absolute -top-3 -right-3 bg-white rounded-2xl shadow-2xl shadow-ink-900/15 px-4 py-3 flex items-center gap-3 max-w-[220px]">
                <div className="w-10 h-10 rounded-full bg-coral-100 flex items-center justify-center text-coral-600 flex-shrink-0">⚡</div>
                <div><div className="font-semibold text-sm">30 min response</div><div className="text-xs text-ink-900/60">Telecaller calls fast</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-gray-50 text-slate-900 pz-reveal">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pz-blob absolute -top-20 left-1/4 w-96 h-96 bg-coral-500/20 rounded-full blur-3xl" />
          <div className="pz-blob2 absolute bottom-0 -right-20 w-[28rem] h-[28rem] bg-coral-400/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-slate-900 text-xs font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-400" style={{ animation: 'piziPulse 1.6s ease-in-out infinite' }} /> Find faster
            </span>
            <h2 className="font-display font-black text-3xl lg:text-5xl mt-4 text-slate-900">Browse by what <span className="text-coral-400">matters.</span></h2>
            <p className="text-slate-900 mt-3 text-lg">Pick your budget, type or city — jump straight to matching PGs.</p>
          </div>

          <div className="space-y-6">
            {/* By Budget */}
            <div className="bg-white border border-gray-200 shadow-lg rounded-3xl p-6 lg:p-8 shadow-xl shadow-black/20">
              <h3 className="font-display font-bold text-xl text-slate-900 mb-5 flex items-center gap-2">💰 By Budget</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                {BUDGETS.map(([img, label, val, tag]) => (
                  <Link key={val} href={`/search?budget_max=${val}`} className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-5 shadow-sm hover:border-coral-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="mb-3"><img src={`${IMG}/${img}`} alt={label} className="w-40 h-40 object-contain mx-auto group-hover:scale-110 transition duration-300" /></div>
                    <div className="font-display font-bold text-base mt-4 text-slate-900">{label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{tag}</div>
                    <div className="text-xs text-coral-400 font-semibold mt-2 inline-flex items-center gap-1">View PGs <span className="group-hover:translate-x-0.5 transition">→</span></div>
                  </Link>
                ))}
              </div>
            </div>
            {/* By Type */}
            <div className="bg-white/[0.06] backdrop-blur border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl shadow-black/20">
              <h3 className="font-display font-bold text-xl text-slate-900 mb-5 flex items-center gap-2">🏠 By Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                {TYPES.map(([img, title, sub, g]) => (
                  <Link key={g} href={`/search?gender=${g}`} className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 flex items-center gap-4 hover:border-coral-400/60 hover:bg-white/10 hover:-translate-y-1 transition duration-300">
                    <div className="flex-shrink-0"><img src={`${IMG}/${img}`} alt={title} className="w-32 h-32 object-contain group-hover:scale-110 transition duration-300" /></div>
                    <div>
                      <div className="font-display font-bold text-lg text-slate-900 group-hover:text-coral-400 transition">{title}</div>
                      <div className="text-sm text-slate-500">{sub}</div>
                    </div>
                    <span className="ml-auto text-coral-400 group-hover:translate-x-1 transition">→</span>
                  </Link>
                ))}
              </div>
            </div>
            {/* By City */}
            <div className="bg-white/[0.06] backdrop-blur border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl shadow-black/20">
              <h3 className="font-display font-bold text-xl text-slate-900 mb-5 flex items-center gap-2">📍 By City</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                {CITY_TILES.map(([name, slug, img]) => (
                  <Link key={slug} href={`/city/${slug}`} className="group bg-white border border-gray-200 rounded-2xl p-6 text-center hover:border-coral-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-center mb-4"><img src={`${IMG}/${img}`} alt={name} className="w-24 h-24 object-contain group-hover:scale-110 transition duration-300" /></div>
                    <h4 className="font-display font-bold text-xl text-slate-900">{name}</h4>
                    <p className="text-coral-500 font-semibold mt-3">Explore →</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="py-16 lg:py-24 pz-reveal">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div><span className="text-coral-600 font-semibold text-sm tracking-wider uppercase">Hand-picked</span><h2 className="font-display font-black text-3xl lg:text-5xl mt-2">Featured stays</h2></div>
              <Link href="/search" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold hover:text-coral-600">See all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p: any) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CITY GRID */}
      {cities.length > 0 && (
        <section className="py-16 lg:py-24 bg-ink-950 text-cream pz-reveal">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-coral-400 font-semibold text-sm tracking-wider uppercase">Locations</span>
              <h2 className="font-display font-black text-3xl lg:text-5xl mt-2">PGs across NCR</h2>
              <p className="text-cream/70 mt-3">Browse by city, find your perfect locality, book your stay.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cities.map((c: any) => (
                <Link key={c.id} href={`/city/${c.slug}`} className="group relative p-6 rounded-2xl bg-ink-900 hover:bg-coral-500 transition overflow-hidden">
                  <div className="text-4xl mb-3">🏙️</div>
                  <h3 className="font-display font-bold text-xl">{c.name}</h3>
                  <p className="text-sm text-cream/60 group-hover:text-white mt-1">{c.properties_count || 0} PGs available</p>
                  <span className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY PIZI */}
      <section className="relative py-16 lg:py-24 overflow-hidden pz-reveal">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-coral-50/40 to-cream" />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="pz-blob absolute -top-16 left-1/4 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl" />
          <div className="pz-blob2 absolute bottom-0 right-10 w-96 h-96 bg-coral-400/10 rounded-full blur-3xl" />
          <div className="pz-blob absolute top-1/2 -left-20 w-72 h-72 bg-ink-900/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 text-coral-700 text-xs font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-500" /> Why choose Pizi
            </span>
            <h2 className="font-display font-black text-3xl lg:text-5xl mt-4 text-ink-950">Everything you need, <span className="text-coral-600">sorted.</span></h2>
            <p className="text-ink-900/60 mt-3 text-lg">Real photos, honest rents, and a team that actually shows up.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {FEATURES.map(([img, title, desc]) => (
              <div key={title} className="group relative bg-white/80 backdrop-blur rounded-3xl border border-white shadow-lg shadow-ink-900/5 p-7 hover:shadow-2xl hover:shadow-coral-500/10 hover:-translate-y-1.5 transition duration-300 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-coral-500/0 group-hover:bg-coral-500/10 rounded-full blur-2xl transition duration-500" />
                <div className="relative flex items-center justify-center"><img src={`${IMG}/${img}`} alt={title} className="w-40 h-40 object-contain group-hover:scale-110 transition duration-300" /></div>
                <h3 className="relative font-display font-bold text-xl mt-5 text-ink-950 group-hover:text-coral-600 transition">{title}</h3>
                <p className="relative text-sm text-ink-900/60 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 lg:py-24 pz-reveal">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-coral-600 font-semibold text-sm tracking-wider uppercase">How it works</span>
            <h2 className="font-display font-black text-3xl lg:text-5xl mt-2">Three steps to your new home.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(([num, title, desc, img]) => (
              <div key={num} className="group p-8 rounded-2xl border border-ink-900/10 hover:border-coral-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="mb-6 flex justify-center"><img src={`${IMG}/${img}`} alt={title} className="w-28 h-28 object-contain group-hover:scale-110 transition duration-300" /></div>
                <div className="text-xs text-coral-600 font-semibold mb-2">STEP {num}</div>
                <h3 className="font-display font-bold text-2xl">{title}</h3>
                <p className="text-ink-900/60 mt-3">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="pb-16 lg:pb-24 pz-reveal">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-950 text-cream p-12 lg:p-16">
            <div className="pz-blob absolute top-0 right-0 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl" />
            <div className="relative max-w-2xl">
              <span className="text-coral-400 font-semibold text-sm tracking-wider uppercase">For PG Owners</span>
              <h2 className="font-display font-black text-3xl lg:text-5xl mt-3">List your PG. Get verified tenants.</h2>
              <p className="text-cream/70 mt-4 text-lg">No brokerage. No upfront fees. You only pay credits when you unlock a real, qualified lead.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="px-6 py-3 rounded-full bg-coral-500 text-white font-semibold hover:bg-coral-600 transition">Get started →</Link>
                <Link href="/about" className="px-6 py-3 rounded-full bg-cream/10 text-cream hover:bg-cream/20 transition">How it works</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      {recentBlogs.length > 0 && (
        <section className="pb-16 lg:pb-24 pz-reveal">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div><span className="text-coral-600 font-semibold text-sm tracking-wider uppercase">Guides &amp; tips</span><h2 className="font-display font-black text-3xl lg:text-5xl mt-2">From the blog</h2></div>
              <Link href="/blog" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold hover:text-coral-600">Read all →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentBlogs.map((blog: any) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block rounded-2xl border border-ink-900/10 overflow-hidden hover:border-coral-500 transition">
                  {blog.cover_image ? (
                    <img src={imageUrl(blog.cover_image) || ''} className="aspect-[16/10] w-full object-cover" alt="" />
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-coral-100 to-coral-50 flex items-center justify-center text-4xl">📝</div>
                  )}
                  <div className="p-6">
                    <div className="text-xs text-coral-600 font-semibold uppercase tracking-wider">{blog.published_at && new Date(blog.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <h3 className="font-display font-bold text-xl mt-2 group-hover:text-coral-600 transition">{blog.title}</h3>
                    <p className="text-sm text-ink-900/60 mt-2 line-clamp-2">{blog.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicShell>
  );
}
