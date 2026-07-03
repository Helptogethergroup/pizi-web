'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';

const seoNav: any[] = [
  { href: '/seo', label: '📊 SEO Dashboard' },
  { href: '/seo/settings', label: '🔍 SEO Pages' },
  { href: '/seo/blogs', label: '📝 Blogs' },
];

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="seo_manager" nav={seoNav}>{children}</DashboardShell>;
}
