'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, imageUrl, formatINR } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';
import { PropertyCard } from '@/components/public/PropertyCard';
import { useAuth } from '@/lib/auth';

const WHATSAPP = '918006680092';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80';

export default function PropertyDetail({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { user } = useAuth();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', slug],
    queryFn: async () => (await api.get(`/public/properties/${slug}`)).data.data,
  });

  // Similar PGs by city name (API detail doesn't return `similar`)
  const cityName = property?.city?.name || '';
  const { data: similarRaw } = useQuery({
    queryKey: ['similar', cityName, property?.id],
    enabled: Boolean(cityName),
    queryFn: async () => (await api.get('/public/search', { params: { q: cityName } })).data.data,
  });
  const similar = (Array.isArray(similarRaw) ? similarRaw : []).filter((p: any) => p.id !== property?.id).slice(0, 3);

  const [lead, setLead] = useState({ name: '', phone: '', email: '', move_in_date: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Prefill from logged-in user
  useEffect(() => {
    if (user) setLead((l) => ({ ...l, name: user.name || l.name, phone: user.phone || l.phone, email: user.email || l.email }));
  }, [user]);

  // Lightbox keyboard nav
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightbox(null); document.body.style.overflow = ''; }
      if (e.key === 'ArrowLeft') setLightbox((i) => (i === null ? 0 : (i - 1 + imageUrls.length) % imageUrls.length));
      if (e.key === 'ArrowRight') setLightbox((i) => (i === null ? 0 : (i + 1) % imageUrls.length));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post('/public/leads', {
        ...lead,
        property_id: property?.id,
        preferred_city: property?.city?.name,
        preferred_locality: property?.locality?.name,
        source: 'website',
      });
      toast.success("Booked! Our team will call within 30 minutes.");
      setLead({ name: '', phone: '', email: '', move_in_date: '', message: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <PublicShell><div className="text-center py-32 text-ink-900/60">Loading...</div></PublicShell>;
  if (!property) return <PublicShell><div className="text-center py-32 text-ink-900/60">Property not found</div></PublicShell>;

  // Build image list: cover first, then gallery; fallback if empty
  const gallery = Array.isArray(property.images) ? property.images : [];
  let imgs: string[] = [];
  if (property.cover_image) imgs.push(property.cover_image);
  gallery.forEach((g: any) => imgs.push(g.image_path ?? g.image ?? g.url ?? g));
  imgs = imgs.filter(Boolean);
  const imageUrls = imgs.length ? imgs.map((p) => imageUrl(p) || p) : [FALLBACK_IMG];
  const imageCount = imageUrls.length;

  const citySlug = (property.city?.name || 'delhi').toLowerCase();
  const genderLabel = property.gender === 'male' ? '👨 Boys only' : property.gender === 'female' ? '👩 Girls only' : '👥 Unisex';
  const sharing = property.sharing_options && typeof property.sharing_options === 'object' && !Array.isArray(property.sharing_options)
    ? property.sharing_options
    : (Array.isArray(property.sharing_options) ? Object.assign({}, property.sharing_options) : {});
  const sharingEntries = Object.entries(sharing).filter(([, v]) => v != null && v !== '');
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];

  const openLightbox = (i: number) => { setLightbox(i); document.body.style.overflow = 'hidden'; };
  const closeLightbox = () => { setLightbox(null); document.body.style.overflow = ''; };
  const navLightbox = (dir: number) => setLightbox((i) => (i === null ? 0 : (i + dir + imageCount) % imageCount));

  return (
    <PublicShell>
      {/* BREADCRUMB */}
      <div className="bg-cream border-b border-ink-900/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-ink-900/60 overflow-x-auto">
            <Link href="/" className="hover:text-coral-600 whitespace-nowrap">Home</Link>
            <span className="text-ink-300">›</span>
            <Link href={`/city/${citySlug}`} className="hover:text-coral-600 whitespace-nowrap">{property.city?.name || 'Delhi'}</Link>
            {property.locality?.name && (<>
              <span className="text-ink-300">›</span>
              <Link href={`/search?q=${encodeURIComponent(property.locality.name)}`} className="hover:text-coral-600 whitespace-nowrap">{property.locality.name}</Link>
            </>)}
            <span className="text-ink-300">›</span>
            <span className="text-ink-950 font-semibold truncate">{property.name}</span>
          </nav>
        </div>
      </div>

      <section className="bg-cream py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* TITLE BLOCK */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {Number(property.is_verified) === 1 && (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                      Verified Property
                    </span>
                  )}
                  {Number(property.is_featured) === 1 && <span className="px-3 py-1 rounded-full bg-coral-500 text-white text-xs font-bold">⭐ Featured</span>}
                  <span className="px-3 py-1 rounded-full bg-coral-50 text-coral-700 text-xs font-bold uppercase tracking-wider">{property.property_type || 'pg'}</span>
                  <span className="px-3 py-1 rounded-full bg-ink-100 text-ink-700 text-xs font-bold">{genderLabel}</span>
                </div>

                <h1 className="font-display font-black text-3xl lg:text-5xl text-ink-950 leading-tight">{property.name}</h1>

                <div className="flex items-center gap-2 text-ink-700 mt-3">
                  <svg className="w-5 h-5 text-coral-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
                  <span className="text-sm lg:text-base">{[property.address_line, property.locality?.name, property.city?.name].filter(Boolean).join(', ')}</span>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1.5 text-ink-700">👁️ {Number(property.view_count || 0).toLocaleString('en-IN')} views</div>
                  <div className="flex items-center gap-1.5 text-ink-700">🛏️ {property.total_rooms ?? 0} rooms</div>
                  {Number(property.available_rooms) > 0
                    ? <div className="text-emerald-700 font-bold">✓ {property.available_rooms} rooms available</div>
                    : <div className="text-amber-700 font-bold">⚠️ Fully occupied</div>}
                </div>
              </div>

              {/* PHOTOS */}
              <div className="bg-white rounded-2xl p-4 lg:p-6 border border-ink-900/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-xl text-ink-950">📸 Photos ({imageCount})</h2>
                  {imageCount > 1 && <button onClick={() => openLightbox(0)} className="text-coral-500 font-bold text-sm hover:text-coral-600">View all →</button>}
                </div>
                <PhotoGrid urls={imageUrls} onOpen={openLightbox} />
              </div>

              {/* QUICK INFO PILLS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InfoPill label="Rent" value={`₹${Number(property.rent_min || 0).toLocaleString('en-IN')}+`} />
                <InfoPill label="Deposit" value={`₹${Number(property.security_deposit || 0).toLocaleString('en-IN')}`} />
                <InfoPill label="Food" value={Number(property.food_included) ? '✓ Yes' : 'No'} />
                <InfoPill label="Type" value={property.property_type || 'PG'} />
              </div>

              {/* ABOUT */}
              {property.description && (
                <div className="bg-white rounded-2xl p-6 border border-ink-900/10">
                  <h2 className="font-display font-bold text-xl text-ink-950 mb-3">📝 About this PG</h2>
                  <p className="text-ink-700 leading-relaxed text-sm lg:text-base whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {/* SHARING OPTIONS */}
              {sharingEntries.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-ink-900/10">
                  <h2 className="font-display font-bold text-xl text-ink-950 mb-4">💰 Room sharing options</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {sharingEntries.map(([type, price]) => (
                      <div key={type} className="p-5 rounded-xl border-2 border-ink-900/10 hover:border-coral-500 transition cursor-pointer">
                        <div className="text-xs text-ink-900/50 uppercase font-bold capitalize">{type} sharing</div>
                        <div className="font-display font-black text-2xl text-ink-950 mt-1">₹{Number(price).toLocaleString('en-IN')}<span className="text-sm font-normal text-ink-900/50">/mo</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AMENITIES */}
              {amenities.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-ink-900/10">
                  <h2 className="font-display font-bold text-xl text-ink-950 mb-4">✨ Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {amenities.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-cream hover:bg-coral-50 transition group">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-coral-100 flex items-center justify-center flex-shrink-0 text-xl group-hover:border-coral-500 transition">{a.icon || '✨'}</div>
                        <span className="text-sm font-semibold text-ink-700">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RULES */}
              {property.rules && (
                <div className="bg-white rounded-2xl p-6 border border-ink-900/10">
                  <h2 className="font-display font-bold text-xl text-ink-950 mb-3">📋 House rules</h2>
                  <p className="text-ink-700 leading-relaxed text-sm lg:text-base whitespace-pre-line">{property.rules}</p>
                </div>
              )}
            </div>

            {/* RIGHT: sticky booking form */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-white rounded-2xl border border-ink-900/10 shadow-xl shadow-ink-950/5 overflow-hidden">
                  <div className="bg-gradient-to-br from-ink-950 to-ink-900 text-cream p-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm opacity-70">From</span>
                      <span className="font-display font-black text-4xl">₹{Number(property.rent_min || 0).toLocaleString('en-IN')}</span>
                      <span className="text-sm opacity-70">/mo</span>
                    </div>
                    {property.rent_max && Number(property.rent_max) !== Number(property.rent_min) && (
                      <div className="text-xs opacity-60 mt-1">Up to ₹{Number(property.rent_max).toLocaleString('en-IN')}/month</div>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-emerald-300 text-sm font-bold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Free site visit · No brokerage
                    </div>
                  </div>

                  <form onSubmit={submitLead} className="p-6 space-y-3">
                    <h3 className="font-display font-bold text-lg text-ink-950">Book a free site visit</h3>
                    {user && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">✅ Logged in as <strong>{user.name}</strong> — details pre-filled</div>}
                    <input required value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Your name *" className="w-full px-4 py-3 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none text-sm" />
                    <input required type="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="Phone number *" className="w-full px-4 py-3 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none text-sm" />
                    <input type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder="Email (optional)" className="w-full px-4 py-3 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none text-sm" />
                    <input type="date" value={lead.move_in_date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setLead({ ...lead, move_in_date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none text-sm" />
                    <textarea rows={2} value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} placeholder="Any specific requirements?" className="w-full px-4 py-3 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none text-sm resize-none" />
                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold text-base transition shadow-lg shadow-coral-500/30 disabled:opacity-50">{submitting ? 'Sending...' : 'Book free site visit →'}</button>
                    <p className="text-xs text-center text-ink-900/50">Our team will call within 30 minutes</p>
                  </form>

                  <div className="px-6 pb-6">
                    <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, I am interested in ' + property.name)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-500/20">💬 WhatsApp Us</a>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">🛡️</div>
                  <div className="font-bold text-emerald-900 text-sm">100% Verified Property</div>
                  <div className="text-xs text-emerald-700 mt-1">Physically inspected by our team</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION MAP */}
      {(property.latitude && property.longitude) || property.google_map_link ? (
        <section className="py-8 lg:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="bg-cream rounded-2xl p-6 lg:p-8 border border-ink-900/10">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                <div>
                  <h2 className="font-display font-bold text-2xl lg:text-3xl text-ink-950">📍 Location</h2>
                  <p className="text-ink-700 text-sm lg:text-base mt-2">{[property.address_line, property.locality?.name, property.city?.name, property.pincode].filter(Boolean).join(', ')}</p>
                </div>
                <a href={property.latitude && property.longitude ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}` : property.google_map_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition shadow-lg shadow-blue-500/20">🧭 Get Directions</a>
              </div>
              <div className="rounded-2xl overflow-hidden border-2 border-ink-100 shadow-lg">
                <iframe
                  src={property.latitude && property.longitude
                    ? `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=16&output=embed`
                    : `https://maps.google.com/maps?q=${encodeURIComponent([property.address_line, property.locality?.name, property.city?.name, property.pincode].filter(Boolean).join(', '))}&output=embed`}
                  width="100%" height={450} style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* SIMILAR */}
      {similar.length > 0 && (
        <section className="py-12 lg:py-16 bg-cream">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-ink-950 mb-6">Similar PGs nearby</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((p: any) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* MOBILE STICKY CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-ink-100 p-3 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="flex-1 px-2">
            <div className="text-xs text-ink-900/50">From</div>
            <div className="font-display font-black text-xl text-ink-950">₹{Number(property.rent_min || 0).toLocaleString('en-IN')}<span className="text-xs font-normal">/mo</span></div>
          </div>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, I want to book ' + property.name)}`} target="_blank" rel="noreferrer" className="px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm">💬 WhatsApp</a>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex-1 px-4 py-3 bg-coral-500 text-white rounded-xl font-bold text-sm">Book →</button>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }} className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl">×</button>
          {imageCount > 1 && <>
            <button onClick={(e) => { e.stopPropagation(); navLightbox(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl">‹</button>
            <button onClick={(e) => { e.stopPropagation(); navLightbox(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl">›</button>
          </>}
          <img src={imageUrls[lightbox]} alt="" className="max-w-full max-h-full p-12" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">{lightbox + 1} / {imageCount}</div>
        </div>
      )}
    </PublicShell>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-ink-900/10">
      <div className="text-xs text-ink-900/50 uppercase font-bold">{label}</div>
      <div className="font-display font-black text-lg text-ink-950 mt-1 capitalize">{value}</div>
    </div>
  );
}

function PhotoGrid({ urls, onOpen }: { urls: string[]; onOpen: (i: number) => void }) {
  const n = urls.length;
  const Img = ({ i, className }: { i: number; className?: string }) => (
    <div className={`relative rounded-xl overflow-hidden cursor-pointer group ${className || ''}`} onClick={() => onOpen(i)}>
      <img src={urls[i]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
    </div>
  );
  if (n === 1) return <div className="aspect-[16/9]"><Img i={0} className="aspect-[16/9]" /></div>;
  if (n === 2) return <div className="grid grid-cols-2 gap-3">{[0, 1].map((i) => <Img key={i} i={i} className="aspect-square" />)}</div>;
  if (n === 3) return (
    <div className="grid grid-cols-3 gap-3">
      <Img i={0} className="col-span-3 sm:col-span-2 sm:row-span-2 aspect-square" />
      <Img i={1} className="aspect-square" />
      <Img i={2} className="aspect-square" />
    </div>
  );
  return (
    <div className="grid grid-cols-4 gap-3">
      <Img i={0} className="col-span-4 sm:col-span-2 sm:row-span-2" />
      {[1, 2, 3, 4].map((i) => urls[i] && (
        <div key={i} className="relative rounded-xl overflow-hidden cursor-pointer group aspect-square" onClick={() => onOpen(i)}>
          <img src={urls[i]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          {i === 4 && n > 5 && (
            <div className="absolute inset-0 bg-ink-950/70 flex flex-col items-center justify-center text-white">
              <span className="text-2xl font-display font-black">+{n - 4}</span>
              <span className="text-xs uppercase tracking-wider">more</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
