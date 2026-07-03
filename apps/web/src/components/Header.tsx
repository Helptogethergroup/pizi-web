'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { isAuthenticated, user, fetchMe, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => { fetchMe(); }, []);

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="font-display font-black text-3xl">
            <span className="text-ink-950">Pi</span>
            <span className="text-coral-500">z</span>
            <span className="text-ink-950">i</span>
          </span>
          <span className="text-[10px] font-bold text-ink-500 tracking-wider hidden sm:inline ml-1">
            LIVE BETTER · STAY SMARTER
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-ink-800">
          <Link href="/search" className="hover:text-coral-500 transition">Browse PGs</Link>
          <Link href="/city/delhi" className="hover:text-coral-500 transition">Delhi</Link>
          <Link href="/city/noida" className="hover:text-coral-500 transition">Noida</Link>
          <Link href="/city/gurgaon" className="hover:text-coral-500 transition">Gurgaon</Link>
          <Link href="/blog" className="hover:text-coral-500 transition">Blog</Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href={user?.role === 'admin' ? '/admin' : '/owner'} className="hidden sm:inline text-sm font-bold hover:text-coral-500">
                {user?.name}
              </Link>
              <button onClick={logout} className="text-sm font-bold text-ink-700 hover:text-coral-500">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline text-sm font-bold hover:text-coral-500">Login</Link>
              <Link href="/register?role=owner" className="btn-dark text-sm">List your PG</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-ink-100 px-4 py-4 space-y-3 bg-white">
          <Link href="/search" className="block font-bold">Browse PGs</Link>
          <Link href="/city/delhi" className="block font-bold">Delhi</Link>
          <Link href="/city/noida" className="block font-bold">Noida</Link>
          <Link href="/city/gurgaon" className="block font-bold">Gurgaon</Link>
          <Link href="/blog" className="block font-bold">Blog</Link>
          {!isAuthenticated && <Link href="/login" className="block font-bold">Login</Link>}
        </div>
      )}
    </header>
  );
}
