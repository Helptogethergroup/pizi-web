'use client';

import { BlogForm } from '@/components/blogs/BlogForm';

export default function Page() {
  return <BlogForm mode="create" apiBase="/seo/blogs" listPath="/seo/blogs" />;
}
