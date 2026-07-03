'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';

const ownerNav = [
  { href: '/owner', icon: '📊', label: 'Dashboard' },
  { href: '/owner/properties', icon: '🏠', label: 'My Properties' },
  { href: '/owner/tenants', icon: '👥', label: 'Tenants' },
  { href: '/owner/rent', icon: '💰', label: 'Rent Bills' },
  { href: '/owner/complaints', icon: '🛠️', label: 'Complaints' },
  { href: '/owner/rooms', icon: '🛏️', label: 'Rooms & Beds' },
  { href: '/owner/agreements', icon: '📄', label: 'Agreements' },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="owner" nav={ownerNav}>{children}</DashboardShell>;
}
