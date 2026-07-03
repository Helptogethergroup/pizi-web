'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';

const FAQS: Array<[string, string]> = [
  ['How fast does Pizi respond?', 'We respond within 30 minutes during office hours (9 AM – 9 PM) via WhatsApp or call.'],
  ['Is listing a PG free on Pizi?', 'Listing is free. You only buy credits to unlock tenant leads. No commission, no recurring charges.'],
  ['Which cities does Pizi cover?', 'We currently cover Delhi NCR including Noida, Gurugram, Greater Noida, and surrounding areas near major universities.'],
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSuccess('');
    try {
      // API requires name, email, message. We also send phone.
      const res = await api.post('/public/contact', {
        name: form.name,
        email: form.email || `${form.phone}@noemail.pizi.in`,
        phone: form.phone,
        message: form.message,
      });
      setSuccess(res.data?.data?.message || "Thanks! We'll get back to you soon.");
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicShell>
      {/* HERO */}
      <section className="py-10 lg:py-14 bg-gradient-to-b from-cream to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-coral-600 font-semibold text-sm tracking-wider uppercase">Get in touch</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl mt-3">We&apos;re here to <span className="italic text-coral-600">help.</span></h1>
          <p className="text-base lg:text-lg text-ink-900/70 mt-4 max-w-2xl mx-auto">Need a PG? Want to list your property? Our team responds within 30 minutes.</p>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="pb-10">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-4">
          <a href="https://wa.me/918006680092?text=Hi%2C%20I%20need%20help%20with%20Pizi" target="_blank" rel="noreferrer" className="p-6 rounded-2xl border border-ink-900/10 hover:border-emerald-500 hover:shadow-md transition group">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-xl mb-3">💬</div>
            <h2 className="font-display font-bold text-lg">WhatsApp</h2>
            <p className="text-sm text-ink-900/60 mt-1">Fastest response. Chat in 30 sec.</p>
            <div className="mt-3 text-emerald-600 font-semibold text-sm group-hover:underline">8006680092 →</div>
          </a>
          <a href="tel:+918006680092" className="p-6 rounded-2xl border border-ink-900/10 hover:border-coral-500 hover:shadow-md transition group">
            <div className="w-11 h-11 rounded-xl bg-coral-50 flex items-center justify-center text-xl mb-3">📞</div>
            <h2 className="font-display font-bold text-lg">Call us</h2>
            <p className="text-sm text-ink-900/60 mt-1">Real person. 9 AM – 9 PM.</p>
            <div className="mt-3 text-coral-600 font-semibold text-sm group-hover:underline">+91 8006680092 →</div>
          </a>
          <a href="mailto:info@pizi.in" className="p-6 rounded-2xl border border-ink-900/10 hover:border-ink-900 hover:shadow-md transition group">
            <div className="w-11 h-11 rounded-xl bg-ink-100 flex items-center justify-center text-xl mb-3">✉️</div>
            <h2 className="font-display font-bold text-lg">Email</h2>
            <p className="text-sm text-ink-900/60 mt-1">Business &amp; partnership queries.</p>
            <div className="mt-3 text-ink-900 font-semibold text-sm group-hover:underline">info@pizi.in →</div>
          </a>
        </div>
      </section>

      {/* FORM + INFO */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-4 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white p-6 lg:p-8 rounded-2xl border border-ink-900/10">
            <h2 className="font-display font-bold text-2xl">Send us a message</h2>
            <p className="text-sm text-ink-900/60 mt-1">We&apos;ll get back within 24 hours.</p>
            {success && <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">✅ {success}</div>}
            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink-900/60 uppercase">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-900/60 uppercase">Phone *</label>
                  <input required type="tel" maxLength={10} pattern="[0-9]{10}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-900/60 uppercase">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-900/60 uppercase">Message *</label>
                <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none" placeholder="Tell us what you need..." />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-semibold transition disabled:opacity-50">{submitting ? 'Sending...' : 'Send message →'}</button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-ink-950 text-cream">
              <h3 className="font-display font-bold text-lg mb-3">⏰ Office Hours</h3>
              <div className="space-y-1.5 text-sm text-cream/80">
                <div className="flex justify-between"><span>Mon – Sat</span><span className="font-semibold">9 AM – 9 PM</span></div>
                <div className="flex justify-between"><span>Sunday</span><span className="font-semibold">10 AM – 6 PM</span></div>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-coral-50 border border-coral-200">
              <h3 className="font-display font-bold text-lg text-ink-950 mb-2">🏢 PG Owner?</h3>
              <p className="text-sm text-ink-900/70 mb-3">List your property and start getting verified tenant leads.</p>
              <Link href="/register" className="inline-block px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-bold text-sm transition">List your PG →</Link>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
              <h3 className="font-display font-bold text-lg text-ink-950 mb-2">🏠 Looking for a PG?</h3>
              <p className="text-sm text-ink-900/70 mb-3">Browse verified PGs across Delhi NCR.</p>
              <Link href="/search" className="inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition">Browse PGs →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display font-black text-2xl text-center mb-6">Common Questions</h2>
          <div className="space-y-3">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group p-5 rounded-xl border border-ink-900/10 bg-white">
                <summary className="font-semibold text-ink-950 cursor-pointer flex justify-between items-center">
                  {q}
                  <span className="text-coral-500 group-open:rotate-180 transition">▾</span>
                </summary>
                <p className="text-sm text-ink-900/70 mt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
