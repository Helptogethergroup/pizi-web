'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function SeoBlogsIndex() {
  const qc = useQueryClient();

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['seo-blogs'],
    queryFn: async () => (await api.get('/seo/blogs')).data.data,
  });

  const toggle = async (id: number) => {
    try {
      await api.patch(`/seo/blogs/${id}/toggle`);
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['seo-blogs'] });
    } catch { toast.error('Failed'); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this blog?')) return;
    try {
      await api.delete(`/seo/blogs/${id}`);
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['seo-blogs'] });
    } catch { toast.error('Failed'); }
  };

  const list = blogs || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">Blog Posts</h1>
          <p className="text-ink-900/60 mt-1">Manage all blog content</p>
        </div>
        <Link href="/seo/blogs/new" className="px-5 py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold transition shadow-lg shadow-coral-500/30">+ Add New Blog</Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-ink-900/70 mb-4">No blogs yet. Create your first one!</p>
          <Link href="/seo/blogs/new" className="inline-block px-5 py-3 bg-coral-500 text-white rounded-xl font-bold">+ Create Blog</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ink-900/10 divide-y divide-ink-900/10">
          {list.map((b: any) => (
            <div key={b.id} className="p-5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {b.is_published == 1 ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Published</span>
                  ) : (
                    <span className="text-xs bg-ink-100 text-ink-900/70 px-2 py-0.5 rounded-full font-bold">Draft</span>
                  )}
                  <span className="text-xs text-ink-900/50">{b.created_at && new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <h3 className="font-bold text-lg">{b.title}</h3>
                {b.excerpt && <p className="text-sm text-ink-900/70 mt-1 line-clamp-2">{b.excerpt}</p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => toggle(b.id)} className={`px-3 py-1.5 ${b.is_published == 1 ? 'bg-amber-500' : 'bg-emerald-500'} text-white rounded-lg text-sm font-bold`}>
                  {b.is_published == 1 ? 'Unpublish' : 'Publish'}
                </button>
                <Link href={`/seo/blogs/${b.id}`} className="px-3 py-1.5 bg-coral-500 text-white rounded-lg text-sm font-bold">Edit</Link>
                <button onClick={() => remove(b.id)} className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-bold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
