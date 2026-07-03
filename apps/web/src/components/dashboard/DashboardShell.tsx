'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface NavItem {
  href?: string;
  label: string;
  type?: 'link' | 'header';
  match?: string;
}

export function DashboardShell({
  children,
  role,
  nav,
}: {
  children: React.ReactNode;
  role: 'owner' | 'admin' | 'telecaller' | 'field' | 'seo_manager';
  nav: NavItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, fetchMe, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: notifs } = useQuery({
    queryKey: ['unread-notifs'],
    queryFn: async () => {
      try {
        const res = await api.get('/user/notifications');
        return res.data.data?.filter((n: any) => !n.read_at) || [];
      } catch { return []; }
    },
    enabled: isAuthenticated,
  });

  useEffect(() => { fetchMe(); }, []);

  useEffect(() => {
    if (user) {
      const allowed: any = {
        admin: ['admin'],
        owner: ['owner', 'admin'],
        telecaller: ['telecaller', 'admin'],
        field: ['field_executive', 'admin'],
        seo_manager: ['seo_manager', 'admin'],
      };
      if (!allowed[role]?.includes(user.role)) router.push('/');
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f6f5f1] flex items-center justify-center">
        <div className="card text-center max-w-md">
          <h2 className="font-display font-bold text-2xl">Login required</h2>
          <p className="text-ink-900/60 mt-2">Please login to access dashboard.</p>
          <Link href="/login" className="btn-primary mt-4 inline-block">Login</Link>
        </div>
      </div>
    );
  }

  const isActive = (item: NavItem) => {
    if (!item.href) return false;
    if (item.match) return pathname.startsWith(item.match);
    if (item.href === `/${role}`) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <div className="min-h-screen bg-[#f6f5f1] flex text-ink-950">
      {/* Sidebar - DARK NAVY (Laravel exact) */}
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:sticky md:top-0 left-0 top-0 z-40 transition-transform w-64 h-screen bg-ink-950 text-cream flex-shrink-0 flex flex-col`}>
        {/* Logo - exact Laravel */}
        <Link href="/" className="px-6 py-5 flex items-center gap-2 border-b border-cream/10">
          <div className="w-8 h-8 rounded-lg bg-coral-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-cream" fill="currentColor">
              <path d="M12 2 2 9v13h7v-7h6v7h7V9z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg">PGFind</span>
        </Link>

        {/* Nav - exact Laravel */}
        <nav className="flex-1 p-4 space-y-1 text-sm overflow-y-auto">
          {nav.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} className="mt-4 mb-2 px-3 text-xs font-bold uppercase text-cream/40">
                  {item.label}
                </div>
              );
            }
            const active = isActive(item);
            return (
              <Link
                key={item.href || idx}
                href={item.href!}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream/5 ${
                  active ? 'bg-cream/10 text-coral-500' : ''
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* View site */}
          <div className="pt-6 mt-6 border-t border-cream/10">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream/5 text-cream/70">
              ← View site
            </Link>
          </div>
        </nav>

        {/* User footer - exact Laravel */}
        <div className="p-4 border-t border-cream/10">
          <div className="px-3 text-xs text-cream/50">Signed in as</div>
          <div className="px-3 text-sm font-semibold truncate">{user?.name}</div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="mt-2 w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-cream/5"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Backdrop on mobile */}
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden" />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="bg-white border-b border-ink-900/10 px-6 py-4 flex items-center justify-between md:hidden">
          <button onClick={() => setOpen(true)} className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="font-display font-bold">PGFind</div>
          <button onClick={() => { logout(); router.push('/'); }} className="text-sm">Logout</button>
        </header>

        {/* Desktop header - exact Laravel */}
        <header className="hidden md:flex bg-white border-b border-ink-900/10 px-6 py-3 items-center justify-end gap-4">
          <Link href="/admin/notifications" className="relative p-2 hover:bg-ink-900/5 rounded-lg">
            <span className="text-2xl">🔔</span>
            {notifs?.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-coral-500 text-white text-xs font-bold flex items-center justify-center">
                {notifs.length > 99 ? '99+' : notifs.length}
              </span>
            )}
          </Link>
          <span className="text-sm text-ink-900/70">Hi, <strong>{user?.name}</strong></span>
        </header>

        <div className="p-6 lg:p-10">{children}</div>
      </div>
    </div>
  );
}
