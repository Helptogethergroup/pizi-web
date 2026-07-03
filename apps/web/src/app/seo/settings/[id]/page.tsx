'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, imageUrl } from '@/lib/api';

export default function SeoSettingsEdit({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const { data: setting, isLoading } = useQuery({
    queryKey: ['seo-setting', id],
    queryFn: async () => (await api.get(`/seo/settings/${id}`)).data.data,
  });

  const [form, setForm] = useState<any>({});
  const [ogImage, setOgImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (setting) {
      setForm({
        page_key: setting.page_key || '',
        page_label: setting.page_label || '',
        meta_title: setting.meta_title || '',
        meta_description: setting.meta_description || '',
        meta_keywords: setting.meta_keywords || '',
        og_title: setting.og_title || '',
        og_description: setting.og_description || '',
        is_active: setting.is_active == 1,
      });
    }
  }, [setting]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'is_active') fd.append(k, v ? '1' : '0');
        else if (v != null) fd.append(k, String(v));
      });
      if (ogImage) fd.append('og_image', ogImage);
      fd.append('_method', 'PATCH');

      await api.post(`/seo/settings/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Saved');
      router.push('/seo/settings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  if (isLoading || !setting) return <div className="text-center py-20">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/seo/settings" className="text-coral-500 font-bold">← Back</Link>
        <h1 className="font-display font-black text-3xl mt-2">Edit SEO Page</h1>
        <p className="text-ink-900/60 mt-1">Update SEO settings</p>
      </div>

      <form onSubmit={submit} className="bg-white p-6 rounded-2xl border border-ink-900/10 max-w-3xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-ink-900/60">Page Key *</label>
            <input required value={form.page_key || ''} onChange={(e) => setForm({ ...form, page_key: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-ink-900/60">Page Label *</label>
            <input required value={form.page_label || ''} onChange={(e) => setForm({ ...form, page_label: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-ink-900/60">Meta Title</label>
          <input maxLength={255} value={form.meta_title || ''} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-ink-900/60">Meta Description</label>
          <textarea rows={3} maxLength={500} value={form.meta_description || ''} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-ink-900/60">Meta Keywords</label>
          <input value={form.meta_keywords || ''} onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
        </div>

        <div className="pt-4 border-t border-ink-900/10">
          <h3 className="font-bold mb-3">📱 Open Graph</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-ink-900/60">OG Title</label>
              <input value={form.og_title || ''} onChange={(e) => setForm({ ...form, og_title: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-ink-900/60">OG Description</label>
              <textarea rows={2} value={form.og_description || ''} onChange={(e) => setForm({ ...form, og_description: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-ink-900/60">OG Image</label>
              {setting.og_image && (
                <div className="mt-1 mb-2"><img src={imageUrl(setting.og_image) || ''} alt="" className="h-24 rounded-lg" /></div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setOgImage(e.target.files?.[0] || null)} className="w-full mt-1 text-sm" />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active || false} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded w-5 h-5" />
          <span className="font-bold">Active</span>
        </label>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={submitting} className="px-6 py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold disabled:opacity-50">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/seo/settings" className="px-6 py-3 border border-ink-900/15 rounded-xl font-bold">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
