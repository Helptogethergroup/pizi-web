'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, imageUrl } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';

export default function BlogIndex() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-blogs'],
    queryFn: async () => (await api.get('/public/blogs')).data.data,
  });
  const blogs = data || [];

  return (
    <PublicShell>
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <span className="text-coral-600 font-semibold text-sm tracking-wider uppercase">Guides & tips</span>
        <h1 className="font-display font-black text-3xl lg:text-5xl mt-2">Pizi Blog</h1>
        <p className="text-ink-900/60 mt-2">Tips, guides, and stories about PG living</p>

        {isLoading ? (
          <div className="text-center py-20 mt-8">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center mt-8">
            <p className="text-ink-900/70">No blog posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {blogs.map((b: any) => (
              <Link key={b.id} href={`/blog/${b.slug}`} className="group block rounded-2xl border border-ink-900/10 overflow-hidden hover:border-coral-500 transition bg-white">
                {b.cover_image ? (
                  <img src={imageUrl(b.cover_image) || ''} className="aspect-[16/10] w-full object-cover" alt="" />
                ) : (
                  <div className="aspect-[16/10] bg-gradient-to-br from-coral-100 to-coral-50 flex items-center justify-center text-4xl">📝</div>
                )}
                <div className="p-6">
                  <div className="text-xs text-coral-600 font-semibold uppercase tracking-wider">
                    {b.published_at && new Date(b.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <h3 className="font-display font-bold text-xl mt-2 group-hover:text-coral-600 transition">{b.title}</h3>
                  <p className="text-sm text-ink-900/60 mt-2 line-clamp-3">{b.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
