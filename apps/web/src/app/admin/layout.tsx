'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';

const adminNav: any[] = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/analytics', label: '📊 Analytics' },
  { href: '/admin/properties', label: 'Properties', match: '/admin/properties' },
  { href: '/admin/properties/new', label: '+ Add Property' },
  { href: '/admin/leads', label: '🎯 All Leads' },
  { href: '/admin/leads/new', label: '+ Add Lead Manually' },
  { href: '/admin/users', label: '👥 Users' },
  { href: '/admin/wallets', label: '💰 Wallets' },
  { href: '/admin/pricing', label: '💲 Pricing' },
  { href: '/admin/blogs', label: '📝 Blogs' },
  { href: '/admin/field-tracker', label: 'Field Tracker' },
  { href: '/admin/packages', label: 'Packages' },
  { type: 'header', label: 'PG Management' },
  { href: '/admin/rooms', label: '🛏️ All Rooms' },
  { href: '/admin/agreements', label: '📄 All Agreements' },
  { href: '/admin/pg-overview', label: '📊 PG Overview' },
  { href: '/admin/tenants', label: '👥 All Tenants' },
  { href: '/admin/rent', label: '💰 All Rent Bills' },
  { href: '/admin/complaints', label: '🛠️ All Complaints' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="admin" nav={adminNav}>{children}</DashboardShell>;
}
