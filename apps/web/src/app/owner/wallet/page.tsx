'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function OwnerWallet() {
  const { data } = useQuery({
    queryKey: ['owner-wallet'],
    queryFn: async () => (await api.get('/owner/wallet')).data.data,
  });

  const wallet = data?.wallet || { balance: 0, lifetime_added: 0, lifetime_spent: 0 };
  const transactions = data?.transactions || [];

  return (
    <div>
      <h1 className="font-display font-black text-4xl mb-2">My Wallet</h1>
      <p className="text-ink-900/60">Manage your credits and view transaction history.</p>

      {/* Balance card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-ink-900 to-ink-950 text-cream relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-coral-500/20 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="text-xs uppercase tracking-wider text-cream/60">Current balance</div>
            <div className="font-display font-black text-6xl mt-2">{Number(wallet.balance).toLocaleString()}</div>
            <div className="text-cream/60 mt-1">credits available</div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-cream/10">
              <div>
                <div className="text-xs text-cream/60">Lifetime added</div>
                <div className="font-bold text-xl mt-1">{Number(wallet.lifetime_added).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-cream/60">Lifetime spent</div>
                <div className="font-bold text-xl mt-1">{Number(wallet.lifetime_spent).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-coral-50 border border-coral-100">
          <div className="text-xs uppercase tracking-wider text-coral-700">Need more credits?</div>
          <h3 className="font-display font-bold text-2xl mt-2">Buy credits</h3>
          <p className="text-sm text-ink-900/60 mt-2">Recharge your wallet to unlock more leads.</p>
          <Link href="/owner/credits" className="block text-center mt-4 w-full py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold">
            Buy credits →
          </Link>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-10 bg-white rounded-2xl border border-ink-900/10 overflow-hidden">
        <div className="p-6 border-b border-ink-900/10">
          <h2 className="font-display font-bold text-xl">Transaction history</h2>
        </div>

        {transactions.length === 0 ? (
          <p className="p-12 text-center text-ink-900/50">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900/5 text-left text-ink-900/60 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">When</th>
                <th>Type</th>
                <th>Source</th>
                <th className="text-right">Amount</th>
                <th className="text-right pr-6">Balance after</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="border-t border-ink-900/5">
                  <td className="px-6 py-3">
                    <div className="text-sm">{tx.created_at && new Date(tx.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                  </td>
                  <td>
                    {tx.type === 'credit' ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-semibold">+ Credit</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-rose-100 text-rose-700 font-semibold">− Debit</span>
                    )}
                  </td>
                  <td className="text-xs">
                    <div>{tx.source_label || tx.source}</div>
                    {tx.notes && <div className="text-ink-900/50 italic mt-0.5">{tx.notes}</div>}
                  </td>
                  <td className={`text-right font-bold ${tx.type === 'credit' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {tx.type === 'credit' ? '+' : '−'}{Number(tx.amount).toLocaleString()}
                  </td>
                  <td className="text-right pr-6 font-semibold">{Number(tx.balance_after || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
