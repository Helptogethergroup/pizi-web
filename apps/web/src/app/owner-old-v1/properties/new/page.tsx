'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function NewProperty() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => (await api.get('/cities')).data.data,
  });

  const { data: localities } = useQuery({
    queryKey: ['localities', selectedCity],
    queryFn: async () => (await api.get(`/cities/${selectedCity}/localities`)).data.data,
    enabled: !!selectedCity,
  });

  const { data: amenities } = useQuery({
    queryKey: ['amenities'],
    queryFn: async () => (await api.get('/amenities')).data.data,
  });

  const [form, setForm] = useState<any>({
    name: '',
    city_id: '',
    locality_id: '',
    address_line: '',
    pincode: '',
    property_type: 'pg',
    gender: 'unisex',
    rent_min: '',
    rent_max: '',
    security_deposit: '',
    description: '',
    rules: '',
    amenity_ids: [] as number[],
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/owner/properties', form);
      toast.success('Property created!');
      router.push('/owner/properties');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAmenity = (id: number) => {
    setForm({
      ...form,
      amenity_ids: form.amenity_ids.includes(id)
        ? form.amenity_ids.filter((a: number) => a !== id)
        : [...form.amenity_ids, id],
    });
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/owner/properties" className="text-sm text-coral-500 font-bold">← Back to Properties</Link>
        <h1 className="font-display font-black text-3xl text-ink-950 mt-2">Add New Property</h1>
      </div>

      <form onSubmit={submit} className="card space-y-5">
        <div>
          <label className="label">Property Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pizi Boys PG Sector 18" className="input" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">City *</label>
            <select required value={form.city_id} onChange={(e) => {
              const cityObj = cities?.find((c: any) => c.id == e.target.value);
              setForm({ ...form, city_id: e.target.value, locality_id: '' });
              setSelectedCity(cityObj?.slug || '');
            }} className="input">
              <option value="">Select city</option>
              {cities?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Locality *</label>
            <select required value={form.locality_id} onChange={(e) => setForm({ ...form, locality_id: e.target.value })} className="input" disabled={!selectedCity}>
              <option value="">Select locality</option>
              {localities?.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Address *</label>
          <input required value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} placeholder="House no, street, area" className="input" />
        </div>

        <div>
          <label className="label">Pincode</label>
          <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="201301" pattern="[0-9]{6}" className="input" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Property Type *</label>
            <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} className="input">
              <option value="pg">PG</option>
              <option value="hostel">Hostel</option>
              <option value="coliving">Co-living</option>
              <option value="flatmate">Flatmate</option>
            </select>
          </div>
          <div>
            <label className="label">Gender *</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input">
              <option value="unisex">Unisex</option>
              <option value="male">Boys only</option>
              <option value="female">Girls only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Min Rent (₹) *</label>
            <input required type="number" value={form.rent_min} onChange={(e) => setForm({ ...form, rent_min: e.target.value })} placeholder="8000" className="input" />
          </div>
          <div>
            <label className="label">Max Rent (₹) *</label>
            <input required type="number" value={form.rent_max} onChange={(e) => setForm({ ...form, rent_max: e.target.value })} placeholder="15000" className="input" />
          </div>
          <div>
            <label className="label">Security Deposit (₹)</label>
            <input type="number" value={form.security_deposit} onChange={(e) => setForm({ ...form, security_deposit: e.target.value })} placeholder="10000" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the property..." className="input resize-none"></textarea>
        </div>

        <div>
          <label className="label">House Rules</label>
          <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={3} placeholder="No smoking, visitors allowed..." className="input resize-none"></textarea>
        </div>

        {/* Amenities */}
        {amenities?.length > 0 && (
          <div>
            <label className="label">Amenities</label>
            <div className="grid grid-cols-3 gap-2">
              {amenities.map((a: any) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAmenity(a.id)}
                  className={`p-3 rounded-lg border text-xs font-bold transition ${
                    form.amenity_ids.includes(a.id)
                      ? 'bg-coral-50 border-coral-500 text-coral-700'
                      : 'bg-white border-ink-200 hover:border-coral-300'
                  }`}
                >
                  {a.icon || '✓'} {a.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-ink-100">
          <Link href="/owner/properties" className="btn-secondary flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
