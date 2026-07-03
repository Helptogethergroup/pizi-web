'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function AdminAddLead() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    property_id: '',
    preferred_locality: '',
    preferred_city: '',
    preferred_gender: '',
    budget_min: '',
    budget_max: '',
    move_in_date: '',
    message: '',
    source: 'manual',
  });

  const { data: properties } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => (await api.get('/admin/properties')).data.data,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leads', form);
      toast.success('Lead added successfully!');
      router.push('/admin/leads');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Link href="/admin/leads" className="text-sm text-coral-500 font-bold">← Back to Leads</Link>
      <h1 className="font-display font-black text-4xl text-ink-950 mt-2">Add Lead Manually</h1>
      <p className="text-ink-700 mt-1">Capture a lead from offline channels</p>

      <form onSubmit={submit} className="card mt-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Phone *</label>
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} pattern="[0-9]{10}" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        </div>

        <div>
          <label className="label">Interested Property</label>
          <select value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })} className="input">
            <option value="">Not specific</option>
            {properties?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Preferred City</label>
            <input value={form.preferred_city} onChange={(e) => setForm({ ...form, preferred_city: e.target.value })} placeholder="e.g. Noida" className="input" />
          </div>
          <div>
            <label className="label">Preferred Locality</label>
            <input value={form.preferred_locality} onChange={(e) => setForm({ ...form, preferred_locality: e.target.value })} placeholder="e.g. Sector 20" className="input" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Gender</label>
            <select value={form.preferred_gender} onChange={(e) => setForm({ ...form, preferred_gender: e.target.value })} className="input">
              <option value="">Any</option>
              <option value="male">Boys</option>
              <option value="female">Girls</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div>
            <label className="label">Budget Min (₹)</label>
            <input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Budget Max (₹)</label>
            <input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Move-In Date</label>
          <input type="date" value={form.move_in_date} onChange={(e) => setForm({ ...form, move_in_date: e.target.value })} className="input" />
        </div>

        <div>
          <label className="label">Source</label>
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="input">
            <option value="manual">Manual Entry</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referral">Referral</option>
            <option value="walk_in">Walk-in</option>
            <option value="tele_inbound">Tele Inbound</option>
            <option value="offline_campaign">Offline Campaign</option>
          </select>
        </div>

        <div>
          <label className="label">Message / Notes</label>
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="input resize-none"></textarea>
        </div>

        <div className="flex gap-3 pt-4 border-t border-ink-100">
          <Link href="/admin/leads" className="btn-secondary flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
            {submitting ? 'Adding...' : 'Add Lead →'}
          </button>
        </div>
      </form>
    </div>
  );
}
