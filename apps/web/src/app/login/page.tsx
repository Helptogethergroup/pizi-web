'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const login = useAuth((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      console.log('[Page] User:', user);
      toast.success('Welcome back!');
      const map = {
        admin: '/admin',
        owner: '/owner',
        telecaller: '/telecaller',
        field_executive: '/field',
        seo_manager: '/seo',
      };
      const dest = map[user.role] || '/';
      setTimeout(() => { window.location.href = dest; }, 500);
    } catch (err) {
      console.error('[Page] Login error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-3xl border border-ink-900/10 shadow-xl shadow-ink-900/5">
        <h1 className="font-display font-black text-3xl">Welcome back.</h1>
        <p className="text-ink-900/60 mt-2 text-sm">Login to manage your listings or leads.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500"
          />
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-ink-900 text-cream rounded-xl font-bold hover:bg-ink-800 disabled:opacity-50"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-900/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-ink-900/50">OR</span>
            </div>
          </div>

          <Link
            href="/login/otp"
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition"
          >
            📱 Login with OTP instead
          </Link>
        </form>

        <p className="text-center text-sm text-ink-900/60 mt-6">
          New here?{' '}
          <Link href="/register" className="text-coral-600 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </section>
  );
}