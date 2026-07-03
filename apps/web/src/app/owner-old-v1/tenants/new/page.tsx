'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function NewTenant() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { data: properties } = useQuery({
    queryKey: ['owner-properties'],
    queryFn: async () => (await api.get('/owner/properties')).data.data,
  });

  const [form, setForm] = useState<any>({
    property_id: '',
    name: '',
    phone: '',
    email: '',
    occupation: '',
    room_number: '',
    bed_number: '',
    monthly_rent: '',
    security_deposit: '',
    move_in_date: '',
    emergency_name: '',
    emergency_phone: '',
    emergency_relation: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/owner/tenants', form);
      toast.success('Tenant added!');
      router.push('/owner/tenants');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add tenant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/owner/tenants" className="text-sm text-coral-500 font-bold">← Back to Tenants</Link>
        <h1 className="font-display font-black text-3xl text-ink-950 mt-2">Add New Tenant</h1>
      </div>

      <form onSubmit={submit} className="card space-y-5">
        <div>
          <label className="label">Property *</label>
          <select required value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })} className="input">
            <option value="">Select property</option>
            {properties?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tenant Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Phone *</label>
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} pattern="[0-9]{10}" placeholder="10 digit" className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Occupation</label>
            <input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Student / Working" className="input" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Room Number</label>
            <input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} placeholder="101" className="input" />
          </div>
          <div>
            <label className="label">Bed Number</label>
            <input value={form.bed_number} onChange={(e) => setForm({ ...form, bed_number: e.target.value })} placeholder="B1" className="input" />
          </div>
          <div>
            <label className="label">Move-In Date</label>
            <input type="date" value={form.move_in_date} onChange={(e) => setForm({ ...form, move_in_date: e.target.value })} className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Monthly Rent (₹) *</label>
            <input required type="number" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Security Deposit (₹)</label>
            <input type="number" value={form.security_deposit} onChange={(e) => setForm({ ...form, security_deposit: e.target.value })} className="input" />
          </div>
        </div>

        <div className="pt-4 border-t border-ink-100">
          <h3 className="font-bold text-ink-950 mb-3">Emergency Contact (optional)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Name</label>
              <input value={form.emergency_name} onChange={(e) => setForm({ ...form, emergency_name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={form.emergency_phone} onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Relation</label>
              <input value={form.emergency_relation} onChange={(e) => setForm({ ...form, emergency_relation: e.target.value })} placeholder="Father" className="input" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-ink-100">
          <Link href="/owner/tenants" className="btn-secondary flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
            {submitting ? 'Adding...' : 'Add Tenant'}
          </button>
        </div>
      </form>
    </div>
  );
}
