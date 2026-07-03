'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, imageUrl } from '@/lib/api';
import { PublicShell } from '@/components/public/PublicShell';

export default function BlogShow({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data: blog, isLoading } = useQuery({
    queryKey: ['public-blog', slug],
    queryFn: async () => (await api.get(`/public/blogs/${slug}`)).data.data,
  });

  if (isLoading) return <PublicShell><div className="text-center py-20">Loading...</div></PublicShell>;
  if (!blog) return <PublicShell><div className="text-center py-20">Blog not found</div></PublicShell>;

  return (
    <PublicShell>
      <article className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
        <Link href="/blog" className="text-coral-500 font-bold text-sm">← Back to blog</Link>

        <div className="text-xs text-coral-600 font-semibold uppercase tracking-wider mt-6">
          {blog.published_at && new Date(blog.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
        <h1 className="font-display font-black text-4xl lg:text-5xl mt-3 leading-tight">{blog.title}</h1>
        {blog.excerpt && <p className="text-lg text-ink-900/70 mt-4">{blog.excerpt}</p>}

        {blog.cover_image && (
          <div className="mt-8 rounded-2xl overflow-hidden">
            <img src={imageUrl(blog.cover_image) || ''} alt={blog.title} className="w-full aspect-[16/9] object-cover" />
          </div>
        )}

        <div className="mt-8 prose prose-lg max-w-none text-ink-900/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
      </article>
    </PublicShell>
  );
}
