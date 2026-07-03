'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'guest',
    password: '', password_confirmation: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', form);
      const data = res.data.data || res.data;
      setUser(data.user, data.token);
      toast.success('Account created!');
      const map: any = { admin: '/admin', owner: '/owner', telecaller: '/telecaller', field_executive: '/field', seo_manager: '/seo' };
      router.push(map[data.user.role] || '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setSubmitting(false); }
  };

  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
        <p className="text-sm text-emerald-900 mb-2">🚀 <strong>Quick signup with OTP</strong></p>
        <Link href="/login/otp?purpose=register" className="inline-block px-5 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold">Register with OTP →</Link>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-ink-900/10 shadow-xl shadow-ink-900/5">
        <h1 className="font-display font-black text-3xl">Get started.</h1>
        <p className="text-ink-900/60 mt-2 text-sm">List your PG or save your favourites.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500" />
          <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500" />
          <input required placeholder="Phone (10-digit)" pattern="[0-9]{10}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500" />

          <div>
            <label className="text-xs font-semibold text-ink-900/60 uppercase">I am a</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <label>
                <input type="radio" name="role" value="guest" checked={form.role === 'guest'} onChange={(e) => setForm({ ...form, role: e.target.value })} className="peer hidden" />
                <div className="text-center text-sm py-3 rounded-lg border border-ink-900/15 cursor-pointer peer-checked:bg-ink-900 peer-checked:text-cream">Tenant / Guest</div>
              </label>
              <label>
                <input type="radio" name="role" value="owner" checked={form.role === 'owner'} onChange={(e) => setForm({ ...form, role: e.target.value })} className="peer hidden" />
                <div className="text-center text-sm py-3 rounded-lg border border-ink-900/15 cursor-pointer peer-checked:bg-ink-900 peer-checked:text-cream">PG Owner</div>
              </label>
            </div>
          </div>

          <input type="password" required placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500" />
          <input type="password" required placeholder="Confirm password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-coral-500" />

          <button type="submit" disabled={submitting} className="w-full py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-900/60 mt-6">
          Already a user?{' '}
          <Link href="/login" className="text-coral-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </section>
  );
}
