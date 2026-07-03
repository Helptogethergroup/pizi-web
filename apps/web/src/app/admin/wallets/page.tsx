'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function AdminWallets() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<any>(null);

  const { data: owners, isLoading } = useQuery({
    queryKey: ['admin-wallets', search],
    queryFn: async () => {
      const params: any = { role: 'owner' };
      if (search) params.search = search;
      return (await api.get('/admin/wallets', { params })).data.data;
    },
  });

  const adjust = async (ownerId: number, amount: number, note: string) => {
    try {
      await api.post(`/admin/wallets/${ownerId}/adjust`, { amount, note });
      toast.success('Adjusted');
      qc.invalidateQueries({ queryKey: ['admin-wallets'] });
      setModal(null);
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h1 className="font-display font-black text-3xl mb-2">Owner Wallets</h1>
      <p className="text-ink-900/60">Manage credit balances for all PG owners.</p>

      <div className="flex gap-2 mt-6 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search owner name or email…"
          className="flex-1 px-3 py-2 rounded-lg border border-ink-900/15"
        />
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/10 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900/5 text-left text-ink-900/60 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Owner</th>
                <th className="text-right">Balance</th>
                <th className="text-right">Lifetime added</th>
                <th className="text-right">Lifetime spent</th>
                <th className="text-center pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {owners?.map((o: any) => {
                const balance = o.wallet?.balance || 0;
                return (
                  <tr key={o.id} className="border-t border-ink-900/5">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{o.name}</div>
                      <div className="text-xs text-ink-900/50">{o.email}</div>
                    </td>
                    <td className="text-right">
                      <span className={`font-display font-bold text-2xl ${balance > 0 ? 'text-emerald-700' : 'text-ink-900/40'}`}>
                        {Number(balance).toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right text-ink-900/60">{Number(o.wallet?.lifetime_added || 0).toLocaleString()}</td>
                    <td className="text-right text-ink-900/60">{Number(o.wallet?.lifetime_spent || 0).toLocaleString()}</td>
                    <td className="text-center pr-4">
                      <button onClick={() => setModal({ owner: o, balance })} className="px-3 py-2 rounded-lg bg-coral-500 text-white text-xs font-bold">
                        + / − Credits
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && <AdjustModal ownerId={modal.owner.id} ownerName={modal.owner.name} balance={modal.balance} onClose={() => setModal(null)} onSave={adjust} />}
    </div>
  );
}

function AdjustModal({ ownerId, ownerName, balance, onClose, onSave }: any) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 bg-ink-950/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between mb-4">
          <h2 className="font-display font-bold text-2xl">Adjust credits</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <p className="text-sm text-ink-900/60">Owner: <strong>{ownerName}</strong></p>
        <p className="text-sm text-ink-900/60 mb-4">Current balance: <strong>{balance}</strong> credits</p>
        <div className="space-y-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (positive to add, negative to deduct)"
            className="w-full px-4 py-3 rounded-xl border border-ink-900/15"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (reason)"
            className="w-full px-4 py-3 rounded-xl border border-ink-900/15"
          />
          <button
            onClick={() => onSave(ownerId, parseInt(amount), note)}
            className="w-full py-3 bg-coral-500 text-white rounded-xl font-bold"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
