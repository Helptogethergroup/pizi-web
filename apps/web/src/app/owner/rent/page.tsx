'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, formatINR } from '@/lib/api';

export default function OwnerRent() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState({ q: '', month: '', status: '' });
  const [genModal, setGenModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['owner-rent', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.q) params.q = filter.q;
      if (filter.month) params.month = filter.month;
      if (filter.status) params.status = filter.status;
      return (await api.get('/owner/rent', { params })).data.data;
    },
  });

  const stats = data?.stats || { total_collected_month: 0, total_pending: 0, overdue_count: 0, paid_count_month: 0 };
  const bills = data?.bills || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">Rent Collection</h1>
          <p className="text-ink-900/60 mt-1">Manage rent bills, payments, and receipts</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setGenModal(true)} className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold">⚡ Generate All Bills</button>
          <Link href="/owner/rent/new" className="px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-coral-500/30">+ New Bill</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200">
          <div className="text-xs text-emerald-700 uppercase font-bold">Collected (This Month)</div>
          <div className="font-display font-black text-2xl text-emerald-700 mt-1">{formatINR(stats.total_collected_month)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200">
          <div className="text-xs text-amber-700 uppercase font-bold">Total Pending</div>
          <div className="font-display font-black text-2xl text-amber-700 mt-1">{formatINR(stats.total_pending)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200">
          <div className="text-xs text-rose-700 uppercase font-bold">Overdue Bills</div>
          <div className="font-display font-black text-3xl text-rose-700 mt-1">{stats.overdue_count}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-200">
          <div className="text-xs text-blue-700 uppercase font-bold">Paid This Month</div>
          <div className="font-display font-black text-3xl text-blue-700 mt-1">{stats.paid_count_month}</div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-ink-900/10 mb-4 flex gap-2 flex-wrap">
        <input
          value={filter.q}
          onChange={(e) => setFilter({ ...filter, q: e.target.value })}
          placeholder="Tenant name or phone..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm"
        />
        <input
          type="month"
          value={filter.month}
          onChange={(e) => setFilter({ ...filter, month: e.target.value })}
          className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm"
        />
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : bills.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">💰</div>
          <p className="text-ink-900/70 mb-4">No rent bills yet.</p>
          <Link href="/owner/rent/new" className="inline-block px-5 py-3 bg-coral-500 text-white rounded-xl font-bold">+ Create First Bill</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill: any) => (
            <div key={bill.id} className="bg-white p-4 rounded-2xl border border-ink-900/10 hover:border-coral-300 transition">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold">{bill.tenant?.name || bill.tenant_name}</h3>
                    <span className="text-xs text-ink-900/50">·</span>
                    <span className="text-xs text-ink-900/70">{bill.month_label || bill.month}</span>
                    {bill.status === 'paid' ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">✓ Paid</span>
                    ) : bill.status === 'partial' ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Partial</span>
                    ) : bill.status === 'overdue' ? (
                      <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">⚠️ Overdue</span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">⏳ Pending</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-900/70 flex-wrap">
                    <span>📱 {bill.tenant?.phone || bill.tenant_phone}</span>
                    {bill.tenant?.room_number && <span>🚪 Room {bill.tenant.room_number}</span>}
                    <span>📅 Due: {bill.due_date && new Date(bill.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span className="font-mono">#{bill.bill_number}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-display font-black text-xl">{formatINR(bill.total_amount)}</div>
                  {bill.due_amount > 0 ? (
                    <div className="text-xs text-rose-600 font-bold">Due: {formatINR(bill.due_amount)}</div>
                  ) : (
                    <div className="text-xs text-emerald-600 font-bold">Fully Paid</div>
                  )}
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  <Link href={`/owner/rent/${bill.id}`} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold">View</Link>
                  {bill.due_amount > 0 && (
                    <a
                      href={`https://wa.me/91${bill.tenant?.phone}?text=${encodeURIComponent(`Hi ${bill.tenant?.name}, your rent of ${formatINR(bill.due_amount)} for ${bill.month_label || bill.month} is pending. Please pay at your earliest.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      💬 Remind
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {genModal && <GenAllModal onClose={() => setGenModal(false)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['owner-rent'] }); setGenModal(false); }} />}
    </div>
  );
}

function GenAllModal({ onClose, onSuccess }: any) {
  const today = new Date();
  const [month, setMonth] = useState(today.toISOString().slice(0, 7));
  const [dueDate, setDueDate] = useState(new Date(today.getFullYear(), today.getMonth(), 5).toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/owner/rent/generate-all', { month, due_date: dueDate });
      const d = res.data.data;
      toast.success(`Generated ${d.generated || 0} bills, ${d.skipped || 0} skipped`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl">⚡ Generate All Bills</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <p className="text-sm text-ink-900/70 mb-4">Generate rent bills for all active tenants for a specific month. Uses each tenant's monthly_rent value.</p>
        <form onSubmit={submit}>
          <label className="text-xs font-bold uppercase text-ink-900/50">Month *</label>
          <input type="month" required value={month} onChange={(e) => setMonth(e.target.value)} className="w-full mt-1 mb-3 px-4 py-2.5 rounded-lg border border-ink-900/15" />

          <label className="text-xs font-bold uppercase text-ink-900/50">Due Date *</label>
          <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full mt-1 mb-4 px-4 py-2.5 rounded-lg border border-ink-900/15" />

          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="flex-1 px-5 py-2.5 bg-coral-500 text-white rounded-lg font-bold disabled:opacity-50">
              {submitting ? 'Generating...' : 'Generate Bills'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-ink-900/15 rounded-lg font-bold">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
