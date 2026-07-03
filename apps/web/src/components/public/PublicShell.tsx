'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const PHONE = '8006680092';
const EMAIL = 'info@pizi.in';
const WHATSAPP = '918006680092';
const LOGO = 'https://pizi.in/assets/images/logo.png';

const CITIES: Array<[string, string]> = [
  ['delhi', 'Delhi'],
  ['noida', 'Noida'],
  ['gurgaon', 'Gurgaon'],
  ['ghaziabad', 'Ghaziabad'],
  ['faridabad', 'Faridabad'],
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [enquiry, setEnquiry] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false); // floating button menu
  const [popupOpen, setPopupOpen] = useState(false);      // contact popup modal

  const openMenu = () => { setMobileMenuOpen(true); document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { setMobileMenuOpen(false); document.body.style.overflow = ''; };
  const openPopup = () => { setPopupOpen(true); document.body.style.overflow = 'hidden'; };
  const closePopup = () => { setPopupOpen(false); document.body.style.overflow = ''; };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closePopup(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  const sendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post('/public/leads', {
        name: enquiry.name,
        phone: enquiry.phone,
        message: enquiry.message || 'Footer enquiry - Looking for PG',
        source: 'footer_enquiry',
      });
      toast.success("Thanks! We'll call you within 30 minutes.");
      setEnquiry({ name: '', phone: '', message: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const dashLink = user?.role === 'admin' ? '/admin'
    : user?.role === 'owner' ? '/owner'
    : user?.role === 'telecaller' ? '/telecaller'
    : user?.role === 'field_executive' ? '/field'
    : user?.role === 'seo_manager' ? '/seo' : '/';
  const dashLabel = user?.role === 'admin' ? '⚡ Admin Dashboard'
    : user?.role === 'owner' ? '📊 My Dashboard'
    : user?.role === 'telecaller' ? '📞 My Leads'
    : user?.role === 'field_executive' ? '🚗 My Visits'
    : user?.role === 'seo_manager' ? '🔍 SEO Panel' : 'Dashboard';
  const dashShort = user?.role === 'admin' ? 'Admin'
    : user?.role === 'owner' ? 'Dashboard'
    : user?.role === 'telecaller' ? 'Leads' : 'Panel';

  return (
    <div className="min-h-screen flex flex-col bg-cream">

      {/* TOP CONTACT BAR */}
      <div className="bg-ink-950 text-cream py-2">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <a href={`tel:${PHONE}`} className="flex items-center gap-1 hover:text-coral-400">📞 {PHONE}</a>
            <a href={`mailto:${EMAIL}`} className="hidden sm:flex items-center gap-1 hover:text-coral-400">✉ {EMAIL}</a>
          </div>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-400">💬 WhatsApp</a>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur-md border-b border-ink-900/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <img src={LOGO} alt="Pizi" className="h-16 lg:h-20 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
            <Link href="/search" className="px-3 py-2 rounded-lg hover:bg-coral-50 hover:text-coral-600 transition">Browse PGs</Link>

            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-coral-50 hover:text-coral-600 transition">
                Cities
                <svg className="w-3.5 h-3.5 transition group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute left-0 top-full pt-2 w-52 z-50">
                <div className="bg-white rounded-2xl shadow-2xl shadow-ink-900/15 border border-ink-900/10 p-2">
                  {CITIES.map(([slug, name]) => (
                    <Link key={slug} href={`/city/${slug}`} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-coral-50 hover:text-coral-600 transition">📍 {name}</Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/universities" className="px-3 py-2 rounded-lg hover:bg-coral-50 hover:text-coral-600 transition">🎓 PGs near Universities</Link>
            <Link href="/blog" className="px-3 py-2 rounded-lg hover:bg-coral-50 hover:text-coral-600 transition">Blog</Link>
            <Link href="/about" className="px-3 py-2 rounded-lg hover:bg-coral-50 hover:text-coral-600 transition">About</Link>
            <button type="button" onClick={openPopup} className="px-3 py-2 rounded-lg hover:bg-coral-50 hover:text-coral-600 transition">Contact</button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 lg:gap-3">
            <a href={`tel:${PHONE}`} className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-coral-500/30 hover:border-coral-500 hover:bg-coral-50 transition">
              <span className="w-8 h-8 rounded-lg bg-coral-500 text-white flex items-center justify-center text-sm flex-shrink-0">📞</span>
              <span className="leading-tight">
                <span className="block text-[10px] text-ink-900/50 font-semibold uppercase tracking-wide">Call us</span>
                <span className="block text-sm font-bold text-ink-950">{PHONE}</span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link href={dashLink} className="text-sm font-medium px-3 py-2 hover:text-coral-600">{dashShort}</Link>
                  <button onClick={logout} className="text-sm font-medium px-3 py-2 hover:text-coral-600">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium px-3 py-2 hover:text-coral-600">Login</Link>
                  <Link href="/register" className="text-sm font-semibold px-4 py-2 rounded-full bg-ink-900 text-cream hover:bg-ink-800 transition">List your PG</Link>
                </>
              )}
            </div>

            <a href={`tel:${PHONE}`} className="md:hidden w-10 h-10 rounded-xl bg-coral-500 text-white flex items-center justify-center shadow-md shadow-coral-500/30" aria-label={`Call ${PHONE}`}>
              <span className="text-lg">📞</span>
            </a>
            <button type="button" onClick={openMenu} className="md:hidden p-2 text-ink-900 hover:text-coral-600 transition" aria-label="Open menu">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div onClick={closeMenu} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-cream shadow-2xl overflow-y-auto">
            <div className="p-5 border-b border-ink-900/10 flex items-center justify-between bg-cream sticky top-0 z-10">
              <Link href="/" onClick={closeMenu} className="flex items-center"><img src={LOGO} alt="Pizi" className="h-8 w-auto" /></Link>
              <button onClick={closeMenu} className="p-2 text-ink-900 hover:text-coral-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="p-4 space-y-1">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-900 hover:bg-coral-50 hover:text-coral-600 font-medium">🏠 Home</Link>
              <Link href="/search" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-900 hover:bg-coral-50 hover:text-coral-600 font-medium">🔍 Browse PGs</Link>
              <div className="border-t border-ink-900/10 my-2 pt-2">
                <div className="px-4 py-1 text-xs uppercase font-bold text-ink-900/40">Cities</div>
                {CITIES.map(([slug, name]) => (
                  <Link key={slug} href={`/city/${slug}`} onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-900 hover:bg-coral-50 hover:text-coral-600 font-medium">📍 {name}</Link>
                ))}
              </div>
              <div className="border-t border-ink-900/10 my-2 pt-2">
                <Link href="/universities" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-900 hover:bg-coral-50 hover:text-coral-600 font-medium">🎓 PGs near Universities</Link>
                <Link href="/blog" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-900 hover:bg-coral-50 hover:text-coral-600 font-medium">📝 Blog</Link>
                <Link href="/about" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-900 hover:bg-coral-50 hover:text-coral-600 font-medium">ℹ About Us</Link>
                <button type="button" onClick={() => { closeMenu(); openPopup(); }} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-ink-900 hover:bg-coral-50 hover:text-coral-600 font-medium">✉ Contact</button>
              </div>
              <div className="border-t border-ink-900/10 my-2 pt-3 space-y-2">
                {user ? (
                  <>
                    <Link href={dashLink} onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-ink-900 text-cream font-bold">{dashLabel}</Link>
                    <button onClick={() => { closeMenu(); logout(); }} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-ink-900 hover:bg-rose-50 hover:text-rose-600 font-medium">🚪 Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-900 hover:bg-coral-50 hover:text-coral-600 font-medium">🔐 Login</Link>
                    <Link href="/register" onClick={closeMenu} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-coral-500 text-white font-bold hover:bg-coral-600">➕ List your PG</Link>
                  </>
                )}
              </div>
              <div className="border-t border-ink-900/10 my-2 pt-3 space-y-2">
                <a href={`tel:${PHONE}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold">📞 Call: {PHONE}</a>
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 px-4 py-2 rounded-xl text-ink-900/80 text-sm">✉ {EMAIL}</a>
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600">💬 WhatsApp Us</a>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="relative bg-gradient-to-b from-ink-900 to-ink-950 text-cream/80 mt-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-1/4 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-coral-400/5 rounded-full blur-3xl" />
        </div>

        {/* Enquiry strip */}
        <div className="relative border-b border-cream/10">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 grid lg:grid-cols-5 gap-6 items-center">
            <div className="lg:col-span-2">
              <h3 className="font-display font-black text-2xl lg:text-3xl text-cream">Looking for a PG?</h3>
              <p className="text-cream/60 mt-2">Fill the form — our team will call you within 30 minutes.</p>
              <div className="mt-4 flex flex-wrap gap-5 text-sm">
                <a href={`tel:${PHONE}`} className="flex items-center gap-2 hover:text-coral-400 transition">📞 <span className="font-bold text-cream">{PHONE}</span></a>
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 hover:text-coral-400 transition">✉ <span className="font-bold text-cream">{EMAIL}</span></a>
              </div>
            </div>
            <form onSubmit={sendEnquiry} className="lg:col-span-3 bg-white text-ink-950 rounded-2xl p-4 lg:p-5 shadow-2xl shadow-black/30">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <input type="text" required value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} placeholder="Your Name *" className="w-full px-4 py-2.5 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500 text-sm" />
                <input type="tel" required pattern="[0-9]{10}" value={enquiry.phone} onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })} placeholder="Phone (10-digit) *" className="w-full px-4 py-2.5 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500 text-sm" />
              </div>
              <input type="text" value={enquiry.message} onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })} placeholder="What kind of PG are you looking for? (Optional)" className="w-full mt-2.5 px-4 py-2.5 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500 text-sm" />
              <button type="submit" disabled={submitting} className="w-full mt-2.5 py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold shadow-lg shadow-coral-500/30 transition disabled:opacity-50">{submitting ? 'Sending...' : 'Submit Enquiry →'}</button>
            </form>
          </div>
        </div>

        {/* Links */}
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center mb-4"><img src={LOGO} alt="Pizi" className="h-16 w-auto brightness-0 invert" /></Link>
            <p className="text-sm leading-relaxed text-cream/60">Verified PGs, hostels &amp; co-living across Delhi NCR. Zero brokerage. Free site visits.</p>
            <div className="flex items-center gap-2 mt-5">
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-cream/10 hover:bg-[#25D366] text-cream flex items-center justify-center transition" title="WhatsApp">💬</a>
              <a href="https://www.instagram.com/pizi.in" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-cream/10 hover:bg-[#d62976] text-cream flex items-center justify-center transition" title="Instagram">📷</a>
              <a href="https://www.facebook.com/piziindia" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-cream/10 hover:bg-[#1877F2] text-cream flex items-center justify-center transition" title="Facebook">f</a>
              <a href={`mailto:${EMAIL}`} className="w-9 h-9 rounded-full bg-cream/10 hover:bg-coral-500 text-cream flex items-center justify-center transition" title="Email">✉</a>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold text-cream mb-4">Cities</h4>
            <ul className="space-y-2.5 text-sm">
              {CITIES.map(([slug, name]) => (
                <li key={slug}><Link href={`/city/${slug}`} className="text-cream/60 hover:text-coral-400 hover:translate-x-1 inline-block transition">PGs in {name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-cream mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="text-cream/60 hover:text-coral-400 hover:translate-x-1 inline-block transition">About</Link></li>
              <li><Link href="/contact" className="text-cream/60 hover:text-coral-400 hover:translate-x-1 inline-block transition">Contact</Link></li>
              <li><Link href="/blog" className="text-cream/60 hover:text-coral-400 hover:translate-x-1 inline-block transition">Blog</Link></li>
              <li><Link href="/register" className="text-cream/60 hover:text-coral-400 hover:translate-x-1 inline-block transition">List your PG</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-cream mb-4">Get in touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><span>📞</span><a href={`tel:${PHONE}`} className="text-cream/60 hover:text-coral-400 font-medium transition">{PHONE}</a></li>
              <li className="flex items-start gap-2"><span>✉</span><a href={`mailto:${EMAIL}`} className="text-cream/60 hover:text-coral-400 break-all transition">{EMAIL}</a></li>
              <li><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 text-xs transition shadow-lg shadow-emerald-500/20">💬 WhatsApp Us</a></li>
            </ul>
          </div>
        </div>

        <div className="relative border-t border-cream/10 py-6">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/50">
            <span>&copy; {new Date().getFullYear()} Pizi.in · All rights reserved</span>
            <span className="flex items-center gap-4">
              <a href="#" className="hover:text-coral-400 transition">Privacy</a>
              <a href="#" className="hover:text-coral-400 transition">Terms</a>
              <span>Made by <span className="text-coral-400">♥</span> heltog pvt limited (heltog.com)</span>
            </span>
          </div>
        </div>
      </footer>

      {/* FLOATING EXPANDABLE CONTACT BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {contactOpen && (
          <div className="flex flex-col items-end gap-3">
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="group flex items-center gap-3" title="WhatsApp">
              <span className="px-3 py-1.5 rounded-lg bg-white text-ink-950 text-sm font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap">WhatsApp</span>
              <span className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition text-xl">💬</span>
            </a>
            <a href={`tel:${PHONE}`} className="group flex items-center gap-3" title="Call us">
              <span className="px-3 py-1.5 rounded-lg bg-white text-ink-950 text-sm font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Call {PHONE}</span>
              <span className="w-12 h-12 rounded-full bg-coral-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition text-lg">📞</span>
            </a>
            <a href="https://www.instagram.com/pizi.in" target="_blank" rel="noreferrer" className="group flex items-center gap-3" title="Instagram">
              <span className="px-3 py-1.5 rounded-lg bg-white text-ink-950 text-sm font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Instagram</span>
              <span className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-xl hover:scale-110 transition text-xl" style={{ background: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)' }}>📷</span>
            </a>
          </div>
        )}
        <button type="button" onClick={() => setContactOpen((v) => !v)} className="w-16 h-16 bg-coral-500 hover:bg-coral-600 rounded-full flex items-center justify-center shadow-2xl shadow-coral-500/50 transition-transform hover:scale-105" title="Contact us" aria-label="Contact us">
          <span className="text-white text-2xl">{contactOpen ? '✕' : '💬'}</span>
        </button>
      </div>

      {/* CONTACT POPUP MODAL */}
      {popupOpen && <ContactPopup onClose={closePopup} />}
    </div>
  );
}

function ContactPopup({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', lookingfor: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const fullMessage = (form.lookingfor ? `[${form.lookingfor}] ` : '') + (form.message || 'Contact popup enquiry');
    try {
      await api.post('/public/leads', {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        message: fullMessage,
        source: 'contact_popup',
      });
      setDone(true);
      setForm({ name: '', email: '', phone: '', lookingfor: '', message: '' });
      setTimeout(onClose, 2000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-coral-500 to-coral-600 px-6 py-5 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl leading-none">×</button>
          <h2 className="font-display font-black text-2xl text-white">Yes, I&apos;m interested! 🎉</h2>
          <p className="text-white/90 text-sm mt-1">Fill your details — we&apos;ll call within 30 minutes.</p>
        </div>
        <div className="p-6">
          {done && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-sm text-emerald-800 font-semibold">✅ Thanks! Our team will contact you soon.</div>}
          <form onSubmit={submit} className="space-y-3">
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your Name *" className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500 text-sm" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500 text-sm" />
            <input type="tel" required pattern="[0-9]{10}" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (10-digit) *" className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500 text-sm" />
            <select value={form.lookingfor} onChange={(e) => setForm({ ...form, lookingfor: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500 text-sm text-ink-900/70">
              <option value="">What are you looking for?</option>
              <option value="Find a PG">🏠 Find a PG</option>
              <option value="List my PG">🏢 List my PG</option>
              <option value="General Enquiry">💬 General Enquiry</option>
            </select>
            <textarea rows={2} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message (optional)" className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500 text-sm" />
            <button type="submit" disabled={submitting} className="w-full py-3.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold shadow-lg shadow-coral-500/30 transition disabled:opacity-50">{submitting ? 'Sending...' : 'Submit →'}</button>
          </form>
          <div className="mt-4 pt-4 border-t border-ink-900/10 flex items-center justify-center gap-4 text-sm">
            <a href={`tel:${PHONE}`} className="flex items-center gap-1.5 text-coral-600 font-semibold hover:underline">📞 Call</a>
            <span className="text-ink-900/20">|</span>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-600 font-semibold hover:underline">💬 WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}
