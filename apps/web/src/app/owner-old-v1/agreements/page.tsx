'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, formatINR } from '@/lib/api';

export default function OwnerAgreements() {
  const [addModal, setAddModal] = useState(false);
  const qc = useQueryClient();

  const { data: agreements, isLoading } = useQuery({
    queryKey: ['owner-agreements'],
    queryFn: async () => (await api.get('/owner/agreements')).data.data,
  });

  const sign = async (id: number) => {
    if (!confirm('Sign this agreement as owner?')) return;
    try {
      await api.post(`/owner/agreements/${id}/sign-owner`, { signature_data: 'owner-signed-' + Date.now() });
      toast.success('Signed!');
      qc.invalidateQueries({ queryKey: ['owner-agreements'] });
    } catch { toast.error('Failed'); }
  };

  const terminate = async (id: number) => {
    const reason = prompt('Reason for termination?');
    if (!reason) return;
    try {
      await api.patch(`/owner/agreements/${id}/terminate`, { reason });
      toast.success('Terminated');
      qc.invalidateQueries({ queryKey: ['owner-agreements'] });
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-ink-950">Agreements</h1>
          <p className="text-ink-700 mt-1">{agreements?.length || 0} agreements</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary">+ New Agreement</button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : agreements?.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-5xl mb-3">📄</div>
          <p className="font-bold">No agreements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agreements?.map((a: any) => (
            <div key={a.id} className="card">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-ink-500">{a.agreement_number}</span>
                    <span className={`badge capitalize ${
                      a.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      a.status === 'signed_owner' || a.status === 'signed_tenant' ? 'bg-blue-100 text-blue-700' :
                      a.status === 'terminated' ? 'bg-rose-100 text-rose-700' :
                      'bg-ink-100 text-ink-700'
                    }`}>{a.status?.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg">{a.tenant_name}</h3>
                  <p className="text-xs text-ink-700">{a.property_name} · Room {a.room_number}</p>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-ink-500">Start</div>
                      <div className="font-bold">{a.start_date}</div>
                    </div>
                    <div>
                      <div className="text-ink-500">End</div>
                      <div className="font-bold">{a.end_date}</div>
                    </div>
                    <div>
                      <div className="text-ink-500">Rent</div>
                      <div className="font-bold text-coral-500">{formatINR(a.monthly_rent)}</div>
                    </div>
                    <div>
                      <div className="text-ink-500">Deposit</div>
                      <div className="font-bold">{formatINR(a.security_deposit)}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {a.status === 'draft' && (
                    <button onClick={() => sign(a.id)} className="btn-primary text-xs">Sign as Owner</button>
                  )}
                  {a.status === 'active' && (
                    <button onClick={() => terminate(a.id)} className="btn-secondary text-xs text-rose-600">Terminate</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addModal && <AddAgreementModal onClose={() => setAddModal(false)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['owner-agreements'] }); setAddModal(false); }} />}
    </div>
  );
}

function AddAgreementModal({ onClose, onSuccess }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    tenant_id: '',
    monthly_rent: '',
    security_deposit: '',
    start_date: '',
    end_date: '',
    lock_in_months: 3,
    notice_period_days: 30,
  });

  const { data: tenants } = useQuery({
    queryKey: ['owner-tenants'],
    queryFn: async () => (await api.get('/owner/tenants')).data.data,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/owner/agreements', form);
      toast.success('Agreement created');
      onSuccess();
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="font-display font-bold text-2xl mb-4">New Agreement</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Tenant *</label>
            <select required value={form.tenant_id} onChange={(e) => setForm({ ...form, tenant_id: e.target.value })} className="input">
              <option value="">Select tenant</option>
              {tenants?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Monthly Rent *</label>
              <input required type="number" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Security Deposit *</label>
              <input required type="number" value={form.security_deposit} onChange={(e) => setForm({ ...form, security_deposit: e.target.value })} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date *</label>
              <input required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input required type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Lock-in (months)</label>
              <input type="number" value={form.lock_in_months} onChange={(e) => setForm({ ...form, lock_in_months: +e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Notice Period (days)</label>
              <input type="number" value={form.notice_period_days} onChange={(e) => setForm({ ...form, notice_period_days: +e.target.value })} className="input" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
