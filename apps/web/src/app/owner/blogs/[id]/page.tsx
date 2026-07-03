'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BlogForm } from '@/components/blogs/BlogForm';

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: blog, isLoading } = useQuery({
    queryKey: ['owner-blog', id],
    queryFn: async () => (await api.get(`/owner/blogs/${id}`)).data.data,
  });

  if (isLoading || !blog) return <div className="text-center py-20">Loading...</div>;

  return <BlogForm mode="edit" initialData={blog} apiBase="/owner/blogs" listPath="/owner/blogs" />;
}
