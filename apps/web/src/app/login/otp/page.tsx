'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function OtpLogin() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/otp/send', { identifier, purpose: 'login' });
      toast.success('OTP sent!');
      sessionStorage.setItem('otp_identifier', identifier);
      router.push('/login/otp/verify');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl">Welcome back</h1>
          <p className="text-ink-900/70 mt-2">Login with mobile number or email</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-ink-900/10 shadow-xl shadow-ink-950/5">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-ink-900/60">Mobile or Email *</label>
              <input required autoFocus value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="9876543210 or you@email.com" className="w-full mt-1 px-4 py-3 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none" />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold text-base transition shadow-lg shadow-coral-500/30 disabled:opacity-50">
              {submitting ? 'Sending...' : 'Send OTP →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ink-900/10 text-center text-sm">
            <Link href="/login" className="text-ink-900/70 hover:text-coral-500">Login with password instead</Link>
          </div>
          <div className="mt-3 text-center text-sm text-ink-900/70">
            New to Pizi? <Link href="/register" className="text-coral-500 font-bold">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
