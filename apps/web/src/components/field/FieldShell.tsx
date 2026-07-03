'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function FieldShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, fetchMe, logout } = useAuth();

  useEffect(() => { fetchMe(); }, []);

  useEffect(() => {
    if (user && !['field_executive', 'admin'].includes(user.role)) {
      router.push('/');
    }
  }, [user]);

  const { data: notifs } = useQuery({
    queryKey: ['unread-notifs-field'],
    queryFn: async () => {
      try {
        const res = await api.get('/user/notifications');
        return res.data.data?.filter((n: any) => !n.read_at) || [];
      } catch { return []; }
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f6f5f1] flex items-center justify-center">
        <div className="card text-center max-w-md p-6">
          <h2 className="font-display font-bold text-2xl">Login required</h2>
          <Link href="/login" className="btn-primary mt-4 inline-block">Login</Link>
        </div>
      </div>
    );
  }

  const unread = notifs?.length || 0;

  return (
    <div className="min-h-screen bg-[#f6f5f1] flex text-ink-950">
      {/* Sidebar — desktop only */}
      <aside className="w-64 bg-ink-950 text-cream flex-shrink-0 hidden md:flex flex-col sticky top-0 h-screen">
        <Link href="/" className="px-6 py-5 flex items-center gap-2 border-b border-cream/10">
          <div className="w-8 h-8 rounded-lg bg-coral-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-cream" fill="currentColor">
              <path d="M12 2 2 9v13h7v-7h6v7h7V9z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg">PGFind</span>
        </Link>

        <nav className="flex-1 p-4 space-y-1 text-sm overflow-y-auto">
          <Link href="/field" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream/5 ${pathname === '/field' ? 'bg-cream/10 text-coral-500' : ''}`}>
            🏠 Today's Visits
          </Link>
          <Link href="/field/visits" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream/5 ${pathname.startsWith('/field/visits') ? 'bg-cream/10 text-coral-500' : ''}`}>
            📋 All Visits
          </Link>
          <Link href="/field/visits?filter=closed" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream/5">
            ✅ Closed Visits
          </Link>
          <Link href="/notifications" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream/5 ${pathname.startsWith('/notifications') ? 'bg-cream/10 text-coral-500' : ''}`}>
            🔔 Notifications
            {unread > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-coral-500 text-white text-xs font-bold">{unread}</span>
            )}
          </Link>

          <div className="pt-6 mt-6 border-t border-cream/10">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream/5 text-cream/70">← View site</Link>
          </div>
        </nav>

        <div className="p-4 border-t border-cream/10">
          <div className="px-3 text-xs text-cream/50">Signed in as</div>
          <div className="px-3 text-sm font-semibold truncate">{user?.name}</div>
          <button onClick={() => { logout(); router.push('/'); }} className="mt-2 w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-cream/5">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Desktop header */}
        <header className="hidden md:flex bg-white border-b border-ink-900/10 px-6 py-3 items-center justify-end gap-4">
          <span className="text-sm text-ink-900/70">Hi, <strong>{user?.name}</strong></span>
          <span className="px-2 py-1 rounded-full text-xs bg-coral-500 text-white font-bold">🚗 Field Executive</span>
          <button onClick={() => { logout(); router.push('/'); }} className="text-sm px-3 py-1.5 rounded-lg border border-ink-900/15 hover:bg-cream">
            Logout
          </button>
        </header>

        {/* Mobile header */}
        <header className="md:hidden bg-ink-950 text-cream px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-cream/60">PGFind Field</div>
            <div className="font-display font-bold">Field Executive</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-cream/80">{user?.name}</span>
            <button onClick={() => { logout(); router.push('/'); }} className="text-xs px-3 py-1.5 rounded-full bg-cream/10">Logout</button>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-10 pb-24 md:pb-10">{children}</div>
      </div>

      {/* MOBILE bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-ink-900/10 md:hidden">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          <Link href="/field" className={`flex flex-col items-center py-3 ${pathname === '/field' ? 'text-coral-500' : 'text-ink-900/60'}`}>
            <div className="text-xl">🏠</div>
            <div className="text-xs font-semibold mt-0.5">Today</div>
          </Link>
          <Link href="/field/visits" className={`flex flex-col items-center py-3 ${pathname.startsWith('/field/visits') ? 'text-coral-500' : 'text-ink-900/60'}`}>
            <div className="text-xl">📋</div>
            <div className="text-xs font-semibold mt-0.5">Visits</div>
          </Link>
          <Link href="/notifications" className={`relative flex flex-col items-center py-3 ${pathname.startsWith('/notifications') ? 'text-coral-500' : 'text-ink-900/60'}`}>
            <div className="text-xl">🔔</div>
            {unread > 0 && (
              <span className="absolute top-2 right-1/4 w-4 h-4 rounded-full bg-coral-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
            )}
            <div className="text-xs font-semibold mt-0.5">Alerts</div>
          </Link>
          <Link href="/field/visits?filter=closed" className="flex flex-col items-center py-3 text-ink-900/60">
            <div className="text-xl">📊</div>
            <div className="text-xs font-semibold mt-0.5">Closed</div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
