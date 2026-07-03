'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function AdminPackages() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', price_inr: '', credits: '', bonus_credits: '0', is_popular: false });
  const [submitting, setSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => (await api.get('/admin/packages')).data.data,
  });

  const stats = data?.stats || { total_revenue: 0, total_payments: 0, failed_payments: 0 };
  const packages = data?.packages || [];

  const toggle = async (id: number) => {
    try {
      await api.patch(`/admin/packages/${id}/toggle`);
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['admin-packages'] });
    } catch { toast.error('Failed'); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this package?')) return;
    try {
      await api.delete(`/admin/packages/${id}`);
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['admin-packages'] });
    } catch { toast.error('Failed'); }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/packages', form);
      toast.success('Package created');
      qc.invalidateQueries({ queryKey: ['admin-packages'] });
      setForm({ name: '', price_inr: '', credits: '', bonus_credits: '0', is_popular: false });
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  return (
    <div>
      <h1 className="font-display font-black text-3xl mb-2">Credit Packages</h1>
      <p className="text-ink-900/60">Manage what owners can buy.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-6 rounded-2xl bg-emerald-100 text-emerald-900">
          <div className="text-xs uppercase tracking-wide opacity-70">Total revenue</div>
          <div className="font-display font-black text-3xl mt-2">₹{Number(stats.total_revenue).toLocaleString()}</div>
        </div>
        <div className="p-6 rounded-2xl bg-ink-900 text-cream">
          <div className="text-xs uppercase tracking-wide opacity-70">Successful payments</div>
          <div className="font-display font-black text-3xl mt-2">{stats.total_payments}</div>
        </div>
        <div className="p-6 rounded-2xl bg-rose-100 text-rose-900">
          <div className="text-xs uppercase tracking-wide opacity-70">Failed payments</div>
          <div className="font-display font-black text-3xl mt-2">{stats.failed_payments}</div>
        </div>
      </div>

      {/* Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {packages.map((p: any) => (
          <div key={p.id} className={`p-6 bg-white rounded-2xl border-2 ${p.is_active == 1 ? 'border-ink-900/10' : 'border-rose-200 opacity-60'}`}>
            <div className="flex justify-between items-start">
              <h3 className="font-display font-bold text-xl">{p.name}</h3>
              {p.is_popular == 1 && <span className="text-xs px-2 py-1 rounded-full bg-coral-500 text-white">⭐ Popular</span>}
            </div>
            <div className="font-display font-black text-3xl mt-2">₹{Number(p.price_inr).toLocaleString()}</div>
            <div className="text-sm text-ink-900/60">{p.total_credits || (p.credits + p.bonus_credits)} credits ({p.credits} + {p.bonus_credits} bonus)</div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => toggle(p.id)} className="text-xs px-3 py-1.5 rounded-lg border border-ink-900/15">
                {p.is_active == 1 ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => remove(p.id)} className="text-xs px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="mt-10 bg-white p-8 rounded-2xl border border-ink-900/10">
        <h2 className="font-display font-bold text-2xl mb-4">+ Add new package</h2>
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Package name (e.g. Starter)" className="px-4 py-3 rounded-xl border border-ink-900/15" />
          <input required type="number" value={form.price_inr} onChange={(e) => setForm({ ...form, price_inr: e.target.value })} placeholder="Price (₹)" className="px-4 py-3 rounded-xl border border-ink-900/15" />
          <input required type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} placeholder="Credits" className="px-4 py-3 rounded-xl border border-ink-900/15" />
          <input type="number" value={form.bonus_credits} onChange={(e) => setForm({ ...form, bonus_credits: e.target.value })} placeholder="Bonus credits" className="px-4 py-3 rounded-xl border border-ink-900/15" />
          <label className="flex items-center gap-2 col-span-full">
            <input type="checkbox" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} />
            <span>Mark as Popular</span>
          </label>
          <button type="submit" disabled={submitting} className="col-span-full px-8 py-3 bg-coral-500 text-white rounded-xl font-bold disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create package'}
          </button>
        </form>
      </div>
    </div>
  );
}
