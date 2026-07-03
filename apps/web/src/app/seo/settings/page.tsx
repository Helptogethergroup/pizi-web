'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function SeoSettingsIndex() {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => (await api.get('/seo/settings')).data.data,
  });

  const remove = async (id: number) => {
    if (!confirm('Delete this SEO page?')) return;
    try {
      await api.delete(`/seo/settings/${id}`);
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['seo-settings'] });
    } catch { toast.error('Failed'); }
  };

  const list = settings || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">SEO Settings</h1>
          <p className="text-ink-900/60 mt-1">All pages with SEO configuration</p>
        </div>
        <Link href="/seo/settings/new" className="px-5 py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold transition shadow-lg shadow-coral-500/30">+ Add SEO Page</Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-ink-900/70 mb-4">No SEO pages yet.</p>
          <Link href="/seo/settings/new" className="inline-block px-5 py-3 bg-coral-500 text-white rounded-xl font-bold">+ Create First Page</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ink-900/10 divide-y divide-ink-900/10">
          {list.map((s: any) => (
            <div key={s.id} className="p-5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-lg">{s.page_label}</h3>
                  {s.is_active == 1 ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Active</span>
                  ) : (
                    <span className="text-xs bg-ink-100 text-ink-900/70 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-ink-900/50">Key: <code className="bg-cream px-2 py-0.5 rounded">{s.page_key}</code></p>
                {s.meta_title && <p className="text-sm text-ink-900/70 mt-2 truncate">{s.meta_title}</p>}
              </div>
              <div className="flex gap-2">
                <Link href={`/seo/settings/${s.id}`} className="px-3 py-1.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm font-bold">Edit</Link>
                <button onClick={() => remove(s.id)} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-bold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
