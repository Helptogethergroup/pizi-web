'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ManualLeadNew() {
  const router = useRouter();
  const user = useAuth((s) => s.user);

  const { data: properties } = useQuery({
    queryKey: ['all-properties-for-lead'],
    queryFn: async () => (await api.get('/properties')).data.data,
  });

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => (await api.get('/cities')).data.data,
  });

  const [form, setForm] = useState<any>({
    name: '', phone: '', email: '',
    source: 'walk_in',
    property_id: '', preferred_city: '', preferred_locality: '',
    preferred_gender: '', move_in_date: '', budget_min: '', budget_max: '',
    message: '', mark_as_verified: false, confirm_duplicate: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [duplicate, setDuplicate] = useState<any>(null);

  const backLink = user?.role === 'admin' ? '/admin/leads' : '/telecaller/leads';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { ...form };
      Object.keys(payload).forEach((k) => {
        if (typeof payload[k] === 'boolean') payload[k] = payload[k] ? 1 : 0;
        if (payload[k] === '') delete payload[k];
      });

      const res = await api.post('/leads/manual', payload);
      const data = res.data.data;
      if (data?.duplicate) {
        setDuplicate(data.duplicate);
        toast.error('Possible duplicate detected');
        return;
      }
      toast.success('Lead saved');
      router.push(backLink);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  const sources = [
    { val: 'walk_in', label: '🚶 Walk-in' },
    { val: 'tele_inbound', label: '📞 Phone call' },
    { val: 'referral', label: '🤝 Referral' },
    { val: 'offline_campaign', label: '📋 Offline event' },
    { val: 'manual', label: '✏️ Other' },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-ink-900/60 mb-2">
        <Link href={backLink} className="hover:text-coral-600">← Back to leads</Link>
      </div>

      <h1 className="font-display font-black text-4xl">+ Add manual lead</h1>
      <p className="text-ink-900/60 mt-2">Walk-in, phone inquiry, referral — capture it here.</p>

      {duplicate && (
        <div className="mt-6 p-5 rounded-2xl bg-amber-50 border-2 border-amber-300">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900">Possible duplicate detected</h3>
              <p className="text-sm text-amber-900/80 mt-1">
                A lead with phone <strong>{duplicate.phone}</strong> already exists.
                Status: <strong>{duplicate.status?.replace('_', ' ')}</strong>.
              </p>
              <p className="text-sm text-amber-900/80 mt-2">If this is a different inquiry, tick "Confirm anyway" below.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 bg-white p-8 rounded-2xl border border-ink-900/10 space-y-6">
        <div>
          <h2 className="font-display font-bold text-xl mb-4">Contact details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-900/60 uppercase">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-900/60 uppercase">Phone *</label>
              <input required pattern="[0-9]{10,15}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500 font-mono" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-ink-900/60 uppercase">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="optional@example.com" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500" />
            </div>
          </div>
        </div>

        <hr className="border-ink-900/5" />

        <div>
          <h2 className="font-display font-bold text-xl mb-4">How did this lead come in?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {sources.map((s) => (
              <label key={s.val}>
                <input type="radio" name="source" value={s.val} checked={form.source === s.val} onChange={(e) => setForm({ ...form, source: e.target.value })} className="peer hidden" />
                <div className="text-center text-sm py-3 rounded-xl border-2 border-ink-900/15 cursor-pointer peer-checked:bg-ink-900 peer-checked:text-cream peer-checked:border-ink-900">
                  {s.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-ink-900/5" />

        <div>
          <h2 className="font-display font-bold text-xl mb-4">Interested in...</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-ink-900/60 uppercase">Specific property (optional)</label>
              <select value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15">
                <option value="">— No specific property / general inquiry —</option>
                {properties?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-900/60 uppercase">Preferred city</label>
              <select value={form.preferred_city} onChange={(e) => setForm({ ...form, preferred_city: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15">
                <option value="">Any</option>
                {cities?.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-900/60 uppercase">Preferred locality</label>
              <input value={form.preferred_locality} onChange={(e) => setForm({ ...form, preferred_locality: e.target.value })} placeholder="e.g. Sector 62" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
            </div>
          </div>
        </div>

        <hr className="border-ink-900/5" />

        <div>
          <h2 className="font-display font-bold text-xl mb-4">Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-900/60 uppercase">Looking for</label>
              <select value={form.preferred_gender} onChange={(e) => setForm({ ...form, preferred_gender: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15">
                <option value="">Any</option>
                <option value="male">Boys PG</option>
                <option value="female">Girls PG</option>
                <option value="unisex">Unisex / Coliving</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-900/60 uppercase">Move-in date</label>
              <input type="date" value={form.move_in_date} onChange={(e) => setForm({ ...form, move_in_date: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-900/60 uppercase">Min budget (₹)</label>
              <input type="number" min={0} step={500} value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} placeholder="6000" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-900/60 uppercase">Max budget (₹)</label>
              <input type="number" min={0} step={500} value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} placeholder="15000" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
            </div>
          </div>
        </div>

        <hr className="border-ink-900/5" />

        <div>
          <label className="text-xs font-semibold text-ink-900/60 uppercase">Notes / message from lead</label>
          <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What did the lead say?" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500" />
        </div>

        {(user?.role === 'admin' || user?.role === 'telecaller') && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.mark_as_verified} onChange={(e) => setForm({ ...form, mark_as_verified: e.target.checked })} className="mt-1 rounded" />
              <div>
                <div className="font-semibold text-emerald-900">Mark as Verified Lead 🎯</div>
                <p className="text-sm text-emerald-900/70 mt-1">If you've spoken to this person and qualified them (budget, intent, timeline), tick this box. Verified leads cost owners more credits.</p>
              </div>
            </label>
          </div>
        )}

        {duplicate && (
          <label className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <input type="checkbox" required checked={form.confirm_duplicate} onChange={(e) => setForm({ ...form, confirm_duplicate: e.target.checked })} className="mt-1 rounded" />
            <span className="text-sm text-amber-900">I've checked the existing lead and confirm this is a separate, valid inquiry. Proceed.</span>
          </label>
        )}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={submitting} className="px-8 py-4 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold text-lg disabled:opacity-50">
            {submitting ? 'Saving...' : 'Save lead →'}
          </button>
          <button type="reset" onClick={() => setForm({ name: '', phone: '', email: '', source: 'walk_in', property_id: '', preferred_city: '', preferred_locality: '', preferred_gender: '', move_in_date: '', budget_min: '', budget_max: '', message: '', mark_as_verified: false, confirm_duplicate: false })} className="px-6 py-4 rounded-xl border border-ink-900/15 font-semibold">Reset</button>
        </div>
      </form>
    </div>
  );
}
