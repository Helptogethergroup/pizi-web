'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RegisterComplete() {
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const [identifier, setIdentifier] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [type, setType] = useState<'phone' | 'email'>('phone');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'guest' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem('otp_identifier') || '';
    const tok = sessionStorage.getItem('otp_token') || '';
    setIdentifier(id);
    setOtpToken(tok);
    setType(/^\d+$/.test(id.replace(/\D/g, '').slice(0, 15)) && !id.includes('@') ? 'phone' : 'email');
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { ...form, otp_token: otpToken };
      if (type === 'phone') payload.phone = identifier;
      else payload.email = identifier;
      const res = await api.post('/auth/register/complete', payload);
      const data = res.data.data || res.data;
      setUser(data.user, data.token);
      toast.success('Welcome to Pizi!');
      sessionStorage.removeItem('otp_identifier');
      sessionStorage.removeItem('otp_token');
      const map: any = { admin: '/admin', owner: '/owner', user: '/' };
      router.push(map[data.user.role] || '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl">Complete signup</h1>
          <p className="text-ink-900/70 mt-2">Just a few more details</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-ink-900/10 shadow-xl shadow-ink-950/5">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-sm mb-4">
            ✓ Verified: <strong>{identifier}</strong>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-ink-900/60">Full name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
            </div>

            {type === 'phone' ? (
              <div>
                <label className="text-xs font-bold uppercase text-ink-900/60">Email (optional)</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold uppercase text-ink-900/60">Mobile number *</label>
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase text-ink-900/60">Password *</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-ink-900/60">I am a *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15">
                <option value="guest">🏠 Looking for PG (Tenant)</option>
                <option value="owner">👤 PG Owner</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} className="w-full py-3.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold text-base shadow-lg shadow-coral-500/30 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
