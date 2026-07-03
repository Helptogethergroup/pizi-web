'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';

const telecallerNav: any[] = [
  { href: '/telecaller', label: '📊 Dashboard' },
  { href: '/telecaller/leads', label: '🎯 My Leads' },
  { href: '/leads/manual/new', label: '+ Add Lead' },
];

export default function TelecallerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="telecaller" nav={telecallerNav}>{children}</DashboardShell>;
}
