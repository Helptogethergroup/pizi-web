'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function AdminPricing() {
  const [pricing, setPricing] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pricing'],
    queryFn: async () => (await api.get('/admin/pricing')).data.data,
  });

  useEffect(() => {
    if (data) setPricing(data);
  }, [data]);

  const updateItem = (idx: number, field: string, value: any) => {
    const next = [...pricing];
    next[idx] = { ...next[idx], [field]: value };
    setPricing(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/admin/pricing', { pricing });
      toast.success('Pricing saved');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const descriptions: any = {
    direct: 'From property listing pages',
    verified: 'Verified by tele-caller',
    converted: 'Already visited / converted',
    manual: 'Manually added by staff',
  };

  return (
    <div>
      <h1 className="font-display font-black text-3xl mb-2">Lead Pricing</h1>
      <p className="text-ink-900/60">Set the credit cost for each lead type. Owners spend these credits to unlock leads.</p>

      {isLoading ? (
        <div className="text-center py-10 mt-8">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {pricing.map((p, idx) => (
              <div key={p.id} className="bg-white p-6 rounded-2xl border border-ink-900/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-xl capitalize">{p.lead_type} Leads</h3>
                    <p className="text-xs text-ink-900/60 mt-1">{descriptions[p.lead_type] || '—'}</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={p.is_active == 1 || p.is_active === true}
                      onChange={(e) => updateItem(idx, 'is_active', e.target.checked ? 1 : 0)}
                      className="rounded"
                    />
                    Active
                  </label>
                </div>

                <label className="text-xs font-semibold text-ink-900/60 uppercase">Credit cost to unlock</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={0}
                    value={p.credit_cost}
                    onChange={(e) => updateItem(idx, 'credit_cost', parseInt(e.target.value))}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-ink-900/15 text-3xl font-bold focus:border-coral-500 outline-none"
                  />
                  <span className="text-ink-900/60">credits</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={save} disabled={saving} className="px-8 py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold disabled:opacity-50">
              {saving ? 'Saving...' : 'Save pricing'}
            </button>
          </div>
        </>
      )}

      <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200">
        <h3 className="font-display font-bold text-lg text-amber-900">💡 How pricing works</h3>
        <p className="text-sm text-amber-900/80 mt-2">
          Each lead type costs a different number of credits. Owners with sufficient credit balance can unlock leads.
          Higher quality leads (verified, converted) cost more credits.
        </p>
      </div>
    </div>
  );
}
