'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';

const ownerNav: any[] = [
  { href: '/owner', label: '📊 Dashboard' },
  { href: '/owner/analytics', label: '📊 Analytics' },
  { href: '/owner/properties', label: '🏠 My Properties', match: '/owner/properties' },
  { href: '/owner/properties/new', label: '+ Add new' },
  { href: '/owner/tenants', label: '👥 My Tenants' },
  { href: '/owner/rent', label: '💰 Rent Collection' },
  { href: '/owner/complaints', label: '🛠️ Complaints' },
  { href: '/owner/rooms', label: '🛏️ Rooms & Beds' },
  { href: '/owner/agreements', label: '📄 Agreements' },
  { href: '/owner/wallet', label: '💰 Wallet' },
  { href: '/owner/blogs', label: '📝 My Blogs' },
  { href: '/owner/credits', label: '💳 Buy Credits' },
  { href: '/owner/leads', label: '🎯 Leads' },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="owner" nav={ownerNav}>{children}</DashboardShell>;
}
