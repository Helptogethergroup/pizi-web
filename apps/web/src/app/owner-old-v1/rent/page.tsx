'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, formatINR } from '@/lib/api';

export default function OwnerRent() {
  const [filter, setFilter] = useState({ status: '', month: '' });
  const [payModal, setPayModal] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const qc = useQueryClient();

  const { data: bills, isLoading } = useQuery({
    queryKey: ['owner-rent', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.status) params.status = filter.status;
      if (filter.month) params.month = filter.month;
      return (await api.get('/owner/rent', { params })).data.data;
    },
  });

  const generateAll = async () => {
    if (!confirm('Generate this month\'s bills for all active tenants?')) return;
    setGenerating(true);
    try {
      const res = await api.post('/owner/rent/generate-all');
      toast.success(`Generated ${res.data.data.generated} bills, ${res.data.data.skipped} skipped`);
      qc.invalidateQueries({ queryKey: ['owner-rent'] });
    } catch (err: any) {
      toast.error('Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  // Stats
  const totalPending = bills?.reduce((sum: number, b: any) => sum + parseFloat(b.due_amount || 0), 0) || 0;
  const totalPaid = bills?.reduce((sum: number, b: any) => sum + parseFloat(b.paid_amount || 0), 0) || 0;
  const overdue = bills?.filter((b: any) => b.status === 'overdue').length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-ink-950">Rent Bills</h1>
          <p className="text-ink-700 mt-1">Track payments and dues</p>
        </div>
        <button onClick={generateAll} disabled={generating} className="btn-primary disabled:opacity-50">
          {generating ? 'Generating...' : '+ Generate Monthly Bills'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card">
          <div className="text-xs text-emerald-700 uppercase font-bold">Collected</div>
          <div className="font-display font-black text-2xl text-emerald-700 mt-1">{formatINR(totalPaid)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-rose-700 uppercase font-bold">Pending</div>
          <div className="font-display font-black text-2xl text-rose-700 mt-1">{formatINR(totalPending)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-amber-700 uppercase font-bold">Overdue Bills</div>
          <div className="font-display font-black text-2xl text-amber-700 mt-1">{overdue}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-5 p-4">
        <div className="grid grid-cols-2 gap-3">
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="input">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <input
            type="month"
            value={filter.month}
            onChange={(e) => setFilter({ ...filter, month: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {/* Bills Table */}
      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : bills?.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-5xl mb-3">💰</div>
          <p className="font-bold">No bills found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-700 text-xs uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Bill #</th>
                  <th className="px-4 py-3 text-left">Tenant</th>
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Due</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b: any) => (
                  <tr key={b.id} className="border-t border-ink-100 hover:bg-cream">
                    <td className="px-4 py-3 font-mono text-xs">{b.bill_number}</td>
                    <td className="px-4 py-3 font-bold">{b.tenant_name}</td>
                    <td className="px-4 py-3">{b.month}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatINR(b.total_amount)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{formatINR(b.paid_amount)}</td>
                    <td className="px-4 py-3 text-right font-bold text-coral-500">{formatINR(b.due_amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge capitalize ${
                        b.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'partial' ? 'bg-amber-100 text-amber-700' :
                        b.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                        'bg-ink-100 text-ink-700'
                      }`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.status !== 'paid' && (
                        <button onClick={() => setPayModal(b)} className="text-coral-500 font-bold hover:underline text-xs">
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payModal && <PaymentModal bill={payModal} onClose={() => setPayModal(null)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['owner-rent'] }); setPayModal(null); }} />}
    </div>
  );
}

function PaymentModal({ bill, onClose, onSuccess }: any) {
  const [form, setForm] = useState({ amount: bill.due_amount, payment_method: 'cash', transaction_ref: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/owner/rent/${bill.id}/payment`, form);
      toast.success('Payment recorded!');
      onSuccess();
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="font-display font-bold text-2xl mb-1">Record Payment</h3>
        <p className="text-sm text-ink-700 mb-4">Bill: {bill.bill_number} · Due: {formatINR(bill.due_amount)}</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Amount Received *</label>
            <input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="input">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="razorpay">Razorpay</option>
              <option value="phonepe">PhonePe</option>
              <option value="paytm">Paytm</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="label">Transaction Reference</label>
            <input value={form.transaction_ref} onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })} placeholder="UTR / Reference" className="input" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
