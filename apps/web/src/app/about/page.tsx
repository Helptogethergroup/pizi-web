'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public/PublicShell';

const VALUES: Array<[string, string, string]> = [
  ['🛡️', 'Verified properties', 'Every PG on Pizi is physically visited by our field team. We check the photos, the amenities, and the owner — before it ever goes live.'],
  ['🤝', 'Owner-direct', 'No brokers in the middle. You talk to the owner. You visit. You decide. Zero brokerage to tenants — ever.'],
  ['📸', 'Real photos only', 'What you see is what you get. Our team uploads honest photos of every room, common area, and bathroom — no filters, no fakes.'],
  ['🚶', 'Free site visits', 'Schedule a visit and our field executive shows you around and helps you negotiate. Completely free — no strings attached.'],
];
const STEPS: Array<[string, string, string]> = [
  ['1', 'Search & filter', 'Browse PGs by city, locality, budget, gender, and amenities. Find exactly what you need.'],
  ['2', 'View verified details', 'See real photos, exact location on map, rent, deposit, and complete amenity list.'],
  ['3', 'Schedule a free visit', 'Book a site visit. Our team helps you tour the property and connect with the owner.'],
  ['4', 'Move in with confidence', 'No brokerage, no surprises. Finalize directly with the owner and move into your new home.'],
];
const OWNER_PERKS: Array<[string, string, string]> = [
  ['🎯', 'Verified Leads', 'Only serious tenants'],
  ['💰', 'No Commission', 'Keep all earnings'],
  ['📱', 'Direct Contact', 'Talk to tenants'],
  ['⚡', 'Instant Listing', 'Go live in minutes'],
];

export default function AboutPage() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal, .reveal-scale'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('active'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <PublicShell>
      <style>{`
        @keyframes aboutFadeUp { from {opacity:0; transform:translateY(30px);} to {opacity:1; transform:translateY(0);} }
        @keyframes aboutScaleIn { from {opacity:0; transform:scale(.9);} to {opacity:1; transform:scale(1);} }
        @keyframes aboutFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
        .reveal{opacity:0;} .reveal.active{animation:aboutFadeUp .7s cubic-bezier(.16,1,.3,1) forwards;}
        .reveal-scale{opacity:0;} .reveal-scale.active{animation:aboutScaleIn .6s cubic-bezier(.16,1,.3,1) forwards;}
        .float-icon{animation:aboutFloat 4s ease-in-out infinite;}
        .delay-1{animation-delay:.1s;} .delay-2{animation-delay:.2s;} .delay-3{animation-delay:.3s;}
        .gradient-text{background:linear-gradient(120deg,#ff6b5b,#ed4e3d);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
        .grain{background-image:radial-gradient(rgba(15,39,72,0.04) 1px,transparent 1px);background-size:16px 16px;}
      `}</style>

      {/* HERO */}
      <section className="grain relative overflow-hidden py-16 lg:py-24">
        <div className="absolute top-20 right-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl float-icon" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-coral-400/5 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 lg:px-8">
          <span className="reveal text-coral-600 font-semibold text-sm tracking-wider uppercase">About Pizi</span>
          <h1 className="reveal delay-1 font-display font-black text-4xl sm:text-5xl lg:text-7xl mt-4 leading-[1.05]">
            We&apos;re fixing how India <span className="gradient-text italic">finds PGs.</span>
          </h1>
          <p className="reveal delay-2 text-lg lg:text-xl text-ink-900/70 mt-6 max-w-2xl leading-relaxed">
            For too long, finding a PG meant fake photos, hidden broker fees, and endless WhatsApp groups. Pizi exists to fix that — one verified property at a time.
          </p>
          <div className="reveal delay-3 mt-8 flex flex-wrap gap-4">
            <Link href="/search" className="px-6 py-3 rounded-full bg-coral-500 text-white font-semibold hover:bg-coral-600 transition shadow-lg shadow-coral-500/30">Browse Verified PGs →</Link>
            <Link href="/register" className="px-6 py-3 rounded-full border-2 border-ink-900/15 font-semibold hover:border-coral-500 transition">List your PG</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 bg-ink-950 text-cream">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['100%', 'Field Verified'], ['₹0', 'Brokerage to Tenants'], ['5+', 'Cities in NCR'], ['30min', 'Response Time']].map(([n, l], i) => (
            <div key={l} className={`reveal-scale ${i ? 'delay-' + i : ''}`}>
              <div className="font-display font-black text-4xl lg:text-5xl text-coral-400">{n}</div>
              <p className="text-cream/60 text-sm mt-2">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OUR STORY */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="reveal">
            <span className="text-coral-600 font-semibold text-sm tracking-wider uppercase">Our Story</span>
            <h2 className="font-display font-black text-3xl lg:text-4xl mt-3">Built by people who struggled to find a PG.</h2>
          </div>
          <div className="reveal delay-1 mt-6 space-y-4 text-ink-900/70 leading-relaxed text-lg">
            <p>Like thousands of students and working professionals moving to Delhi NCR, our founders knew the pain first-hand — paying brokers for a single phone number, visiting PGs that looked nothing like their photos, and chasing owners who never picked up.</p>
            <p>We believed there had to be a better way. So we built Pizi: a platform where every property is physically visited, every photo is real, and every owner is reachable directly. No brokers. No fake listings. No surprises.</p>
            <p className="font-semibold text-ink-950">Today, Pizi helps thousands of tenants find homes they can trust — and helps PG owners reach genuine tenants without paying hefty commissions.</p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 bg-gradient-to-b from-cream to-white">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="reveal text-coral-600 font-semibold text-sm tracking-wider uppercase">What makes us different</span>
            <h2 className="reveal delay-1 font-display font-black text-3xl lg:text-4xl mt-3">The Pizi promise.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map(([icon, title, desc], i) => (
              <div key={title} className={`reveal ${i ? 'delay-' + i : ''} group p-8 rounded-2xl bg-white border border-ink-900/10 hover:border-coral-300 hover:shadow-xl transition-all hover:-translate-y-1`}>
                <div className="text-5xl mb-4 inline-block group-hover:scale-110 transition">{icon}</div>
                <h3 className="font-display font-bold text-2xl">{title}</h3>
                <p className="text-ink-900/70 mt-3 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="reveal text-coral-600 font-semibold text-sm tracking-wider uppercase">How it works</span>
            <h2 className="reveal delay-1 font-display font-black text-3xl lg:text-4xl mt-3">Find your PG in 4 simple steps.</h2>
          </div>
          <div className="space-y-6">
            {STEPS.map(([num, title, desc], i) => (
              <div key={num} className={`reveal ${i ? 'delay-' + i : ''} flex gap-5 items-start`}>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coral-500 text-white flex items-center justify-center font-display font-black text-lg">{num}</div>
                <div>
                  <h3 className="font-display font-bold text-xl">{title}</h3>
                  <p className="text-ink-900/70 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR OWNERS */}
      <section className="py-16 bg-gradient-to-br from-coral-50 to-cream">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="reveal">
            <span className="text-coral-600 font-semibold text-sm tracking-wider uppercase">For PG Owners</span>
            <h2 className="font-display font-black text-3xl lg:text-4xl mt-3">Reach genuine tenants. Pay zero commission.</h2>
            <p className="text-ink-900/70 mt-4 leading-relaxed text-lg">List your property on Pizi and start receiving verified tenant leads. No recurring subscriptions, no hidden charges — just buy credits and unlock leads when you need them.</p>
            <Link href="/register" className="inline-block mt-6 px-6 py-3 rounded-full bg-coral-500 text-white font-semibold hover:bg-coral-600 transition shadow-lg shadow-coral-500/30">List your PG free →</Link>
          </div>
          <div className="reveal delay-1 grid grid-cols-2 gap-4">
            {OWNER_PERKS.map(([icon, title, sub]) => (
              <div key={title} className="p-6 rounded-2xl bg-white border border-ink-900/10">
                <div className="text-3xl mb-2">{icon}</div>
                <p className="font-bold text-ink-950">{title}</p>
                <p className="text-sm text-ink-900/60 mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-24 bg-ink-950 text-cream relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="reveal font-display font-black text-3xl lg:text-5xl">Our promise to you.</h2>
          <p className="reveal delay-1 text-cream/70 mt-6 text-lg max-w-2xl mx-auto leading-relaxed">Every property on Pizi is verified. Every owner is real. Every photo is honest. We&apos;re not just another listing site — we&apos;re your trusted partner in finding a home you&apos;ll love.</p>
          <div className="reveal delay-2 mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/search" className="px-8 py-4 rounded-full bg-coral-500 text-white font-semibold hover:bg-coral-600 transition shadow-lg shadow-coral-500/30">Browse Verified PGs →</Link>
            <a href="tel:8006680092" className="px-8 py-4 rounded-full border-2 border-cream/20 font-semibold hover:border-coral-400 hover:text-coral-400 transition">📞 Talk to us</a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
