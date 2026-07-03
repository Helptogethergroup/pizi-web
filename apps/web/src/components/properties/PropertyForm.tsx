'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, imageUrl } from '@/lib/api';

export function PropertyForm({
  initialData,
  mode,
  apiBase,
  listPath,
}: {
  initialData?: any;
  mode: 'create' | 'edit';
  apiBase: string;
  listPath: string;
}) {
  const router = useRouter();

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => (await api.get('/cities')).data.data,
  });

  const { data: localities } = useQuery({
    queryKey: ['localities'],
    queryFn: async () => (await api.get('/localities')).data.data,
  });

  const { data: amenities } = useQuery({
    queryKey: ['amenities'],
    queryFn: async () => (await api.get('/amenities')).data.data,
  });

  const [form, setForm] = useState<any>({
    name: '', city_id: '', locality_id: '', locality_name: '',
    gender: 'unisex', property_type: 'pg', description: '',
    rent_min: '', rent_max: '', security_deposit: '', food_included: false,
    sharing_single: '', sharing_double: '', sharing_triple: '',
    address_line: '', landmark: '', pincode: '',
    total_rooms: '', available_rooms: '',
    google_map_link: '', latitude: '', longitude: '',
    rules: '', amenities: [] as number[],
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<FileList | null>(null);
  const [manualLocality, setManualLocality] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        city_id: initialData.city_id || '',
        locality_id: initialData.locality_id || '',
        locality_name: '',
        gender: initialData.gender || 'unisex',
        property_type: initialData.property_type || 'pg',
        description: initialData.description || '',
        rent_min: initialData.rent_min || '',
        rent_max: initialData.rent_max || '',
        security_deposit: initialData.security_deposit || '',
        food_included: initialData.food_included == 1,
        sharing_single: initialData.sharing_options?.single || '',
        sharing_double: initialData.sharing_options?.double || '',
        sharing_triple: initialData.sharing_options?.triple || '',
        address_line: initialData.address_line || '',
        landmark: initialData.landmark || '',
        pincode: initialData.pincode || '',
        total_rooms: initialData.total_rooms || '',
        available_rooms: initialData.available_rooms || '',
        google_map_link: initialData.google_map_link || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        rules: initialData.rules || '',
        amenities: (initialData.amenities || []).map((a: any) => a.id),
      });
    }
  }, [initialData]);

  const filteredLocalities = useMemo(() => {
    if (!form.city_id) return localities || [];
    return (localities || []).filter((l: any) => l.city_id == form.city_id);
  }, [localities, form.city_id]);

  const toggleAmenity = (id: number) => {
    setForm((prev: any) => ({
      ...prev,
      amenities: prev.amenities.includes(id) ? prev.amenities.filter((x: number) => x !== id) : [...prev.amenities, id],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') {
          (v as number[]).forEach((id) => fd.append('amenities[]', String(id)));
        } else if (k === 'food_included') {
          fd.append(k, v ? '1' : '0');
        } else if (v != null && v !== '') {
          fd.append(k, String(v));
        }
      });
      if (coverImage) fd.append('cover_image', coverImage);
      if (gallery) Array.from(gallery).forEach((f) => fd.append('images[]', f));

      if (mode === 'edit') {
        fd.append('_method', 'PUT');
        await api.post(`${apiBase}/${initialData.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post(apiBase, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(mode === 'create' ? 'Property submitted' : 'Updated');
      router.push(listPath);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href={listPath} className="text-coral-500 font-bold text-sm">← Back to properties</Link>
        <h1 className="font-display font-black text-3xl mt-2">{mode === 'create' ? 'Add Property' : 'Edit Property'}</h1>
      </div>

      <form onSubmit={submit} className="space-y-6 bg-white p-8 rounded-2xl border border-ink-900/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Property name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">City</label>
            <select required value={form.city_id} onChange={(e) => setForm({ ...form, city_id: e.target.value, locality_id: '' })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15">
              <option value="">— Select city —</option>
              {cities?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-ink-900/60">Locality *</label>
            <div className="mt-1 flex gap-2">
              <select value={form.locality_id} onChange={(e) => setForm({ ...form, locality_id: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-ink-900/15" disabled={manualLocality}>
                <option value="">— Select locality —</option>
                {filteredLocalities.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <button type="button" onClick={() => setManualLocality(!manualLocality)} className="px-3 py-2 bg-ink-950 text-cream rounded-xl text-sm font-bold whitespace-nowrap">
                {manualLocality ? '×' : '+ New'}
              </button>
            </div>
            {manualLocality && (
              <div className="mt-2">
                <input value={form.locality_name} onChange={(e) => setForm({ ...form, locality_name: e.target.value })} placeholder="Type new locality name..." className="w-full px-4 py-3 rounded-xl border-2 border-coral-500 bg-coral-50" />
                <p className="text-xs text-coral-700 mt-1">💡 New locality will be saved automatically.</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">For</label>
            <select required value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15">
              <option value="unisex">Unisex</option>
              <option value="male">Boys only</option>
              <option value="female">Girls only</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Type</label>
            <select required value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15">
              <option value="pg">PG</option>
              <option value="hostel">Hostel</option>
              <option value="coliving">Co-living</option>
              <option value="flatmate">Flatmate</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-900/60 uppercase">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Rent (min ₹)</label>
            <input type="number" required value={form.rent_min} onChange={(e) => setForm({ ...form, rent_min: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Rent (max ₹)</label>
            <input type="number" required value={form.rent_max} onChange={(e) => setForm({ ...form, rent_max: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Deposit ₹</label>
            <input type="number" value={form.security_deposit} onChange={(e) => setForm({ ...form, security_deposit: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.food_included} onChange={(e) => setForm({ ...form, food_included: e.target.checked })} className="rounded" />
              Food included
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Single sharing ₹</label>
            <input type="number" value={form.sharing_single} onChange={(e) => setForm({ ...form, sharing_single: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Double sharing ₹</label>
            <input type="number" value={form.sharing_double} onChange={(e) => setForm({ ...form, sharing_double: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Triple sharing ₹</label>
            <input type="number" value={form.sharing_triple} onChange={(e) => setForm({ ...form, sharing_triple: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-900/60 uppercase">Address</label>
          <input required value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Landmark</label>
            <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Pincode</label>
            <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Total rooms</label>
            <input type="number" value={form.total_rooms} onChange={(e) => setForm({ ...form, total_rooms: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">Available rooms</label>
            <input type="number" value={form.available_rooms} onChange={(e) => setForm({ ...form, available_rooms: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-ink-900/60 mb-2 block">🗺️ Google Maps Link</label>
          <input type="url" value={form.google_map_link} onChange={(e) => setForm({ ...form, google_map_link: e.target.value })} placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/place/..." className="w-full px-4 py-3 rounded-xl border border-ink-900/15 text-sm" />
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            <strong>How to get the link:</strong>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Open <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="underline font-bold">Google Maps</a></li>
              <li>Search your PG location</li>
              <li>Click <strong>"Share"</strong> button</li>
              <li>Copy the link and paste here ⬆️</li>
            </ol>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-900/60 uppercase">Amenities</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {amenities?.map((a: any) => (
              <label key={a.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.amenities.includes(a.id)} onChange={() => toggleAmenity(a.id)} className="rounded" />
                <span>{a.icon} {a.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-900/60 uppercase">Cover image</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} className="w-full mt-1" />
          {initialData?.cover_image && <img src={imageUrl(initialData.cover_url || initialData.cover_image) || ''} alt="" className="w-32 h-24 mt-2 rounded-lg object-cover" />}
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-900/60 uppercase">Gallery images (multiple)</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setGallery(e.target.files)} className="w-full mt-1" />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-900/60 uppercase">House rules</label>
          <textarea rows={3} value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="px-8 py-3 bg-coral-500 text-white rounded-xl font-bold disabled:opacity-50">
            {submitting ? 'Saving...' : (mode === 'edit' ? 'Update property' : 'Submit for verification')}
          </button>
          <Link href={listPath} className="px-6 py-3 rounded-xl border border-ink-900/15 font-semibold">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
