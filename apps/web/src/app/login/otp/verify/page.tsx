'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function OtpVerify() {
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const [otp, setOtp] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    setIdentifier(sessionStorage.getItem('otp_identifier') || '');
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const verify = async (otpVal: string) => {
    setSubmitting(true);
    try {
      const res = await api.post('/auth/otp/verify', { identifier, otp: otpVal });
      const data = res.data.data || res.data;
      if (data.is_new) {
        sessionStorage.setItem('otp_token', data.token);
        router.push('/register/complete');
      } else {
        setUser(data.user, data.token);
        toast.success('Logged in!');
        const map: any = {
          admin: '/admin', owner: '/owner', telecaller: '/telecaller',
          field_executive: '/field', seo_manager: '/seo',
        };
        router.push(map[data.user.role] || '/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setSubmitting(false); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) verify(otp);
  };

  const resend = async () => {
    if (timer > 0) return;
    try {
      await api.post('/auth/otp/resend', { identifier });
      toast.success('OTP resent');
      setTimer(60);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl">Enter OTP</h1>
          <p className="text-ink-900/70 mt-2">
            We sent a 6-digit code to <strong>{identifier}</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-ink-900/10 shadow-xl shadow-ink-950/5">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-ink-900/60">6-digit OTP *</label>
              <input
                required maxLength={6} inputMode="numeric" pattern="[0-9]{6}" autoFocus
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setOtp(v);
                  if (v.length === 6) verify(v);
                }}
                placeholder="••••••"
                className="w-full mt-1 px-4 py-4 rounded-xl border border-ink-900/15 focus:border-coral-500 outline-none text-center text-3xl font-bold tracking-[0.5em]"
              />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold text-base shadow-lg shadow-coral-500/30 disabled:opacity-50">
              {submitting ? 'Verifying...' : 'Verify & Login →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ink-900/10 flex items-center justify-between text-sm">
            <Link href="/login/otp" className="text-ink-900/70 hover:text-coral-500">← Change number</Link>
            <button onClick={resend} disabled={timer > 0} className="text-coral-500 font-bold disabled:opacity-50">
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
