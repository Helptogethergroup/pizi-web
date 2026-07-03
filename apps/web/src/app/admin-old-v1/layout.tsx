'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';

const adminNav = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/properties', icon: '🏠', label: 'All Properties' },
  { href: '/admin/tenants', icon: '👥', label: 'All Tenants' },
  { href: '/admin/rent', icon: '💰', label: 'All Bills' },
  { href: '/admin/complaints', icon: '🛠️', label: 'All Complaints' },
  { href: '/admin/users', icon: '👤', label: 'Users' },
  { href: '/admin/leads', icon: '📞', label: 'Leads' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="admin" nav={adminNav}>{children}</DashboardShell>;
}
