'use client';

import { BlogForm } from '@/components/blogs/BlogForm';

export default function Page() {
  return <BlogForm mode="create" apiBase="/owner/blogs" listPath="/owner/blogs" />;
}
