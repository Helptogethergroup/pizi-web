'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, imageUrl } from '@/lib/api';

export function BlogForm({
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
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', meta_title: '', meta_description: '', is_published: false,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || '',
        is_published: initialData.is_published == 1,
      });
    }
  }, [initialData]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'is_published') fd.append(k, v ? '1' : '0');
        else if (v != null) fd.append(k, String(v));
      });
      if (coverImage) fd.append('cover_image', coverImage);
      if (mode === 'edit') {
        fd.append('_method', 'PATCH');
        await api.post(`${apiBase}/${initialData.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post(apiBase, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(mode === 'create' ? 'Created' : 'Saved');
      router.push(listPath);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href={listPath} className="text-coral-500 font-bold">← Back to blogs</Link>
        <h1 className="font-display font-black text-3xl mt-2">{mode === 'create' ? 'Create New Blog' : 'Edit Blog'}</h1>
      </div>

      <form onSubmit={submit} className="bg-white p-6 rounded-2xl border border-ink-900/10 max-w-4xl space-y-4">
        <div>
          <label className="text-xs font-bold uppercase text-ink-900/60">Title *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter blog title..." className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 text-lg" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-ink-900/60">Excerpt (short summary)</label>
          <textarea rows={2} maxLength={500} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="2-3 line summary..." className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-ink-900/60">Content *</label>
          <textarea required rows={15} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your blog content here. HTML supported." className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
          <p className="text-xs text-ink-900/50 mt-1">💡 You can use basic HTML tags like &lt;b&gt;, &lt;i&gt;, &lt;a&gt;, &lt;br&gt;</p>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-ink-900/60">Cover Image</label>
          {initialData?.cover_image && (
            <div className="mt-1 mb-2"><img src={imageUrl(initialData.cover_image) || ''} alt="" className="h-32 rounded-lg" /></div>
          )}
          <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} className="w-full mt-1 text-sm" />
        </div>

        <div className="pt-4 border-t border-ink-900/10">
          <h3 className="font-bold mb-3">🔍 SEO Settings (optional)</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase text-ink-900/60">Meta Title</label>
              <input maxLength={200} value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-ink-900/60">Meta Description</label>
              <textarea rows={2} maxLength={500} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded w-5 h-5" />
          <span className="font-bold">Publish immediately</span>
        </label>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={submitting} className="px-6 py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold disabled:opacity-50">
            {submitting ? 'Saving...' : 'Save Blog'}
          </button>
          <Link href={listPath} className="px-6 py-3 border border-ink-900/15 rounded-xl font-bold">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
