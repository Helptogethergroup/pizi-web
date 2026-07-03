'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function OwnerCredits() {
  const { data: walletData } = useQuery({
    queryKey: ['owner-wallet'],
    queryFn: async () => (await api.get('/owner/wallet')).data.data,
  });

  const { data: packagesData } = useQuery({
    queryKey: ['owner-packages'],
    queryFn: async () => (await api.get('/owner/packages')).data.data,
  });

  const wallet = walletData?.wallet || { balance: 0 };
  const packages = packagesData || [];

  const buy = async (pkg: any) => {
    try {
      const res = await api.post('/owner/credits/buy', { package_id: pkg.id });
      const order = res.data.data;
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay({
          key: order.razorpay_key,
          amount: order.amount,
          currency: 'INR',
          name: 'Pizi',
          description: `${pkg.name} — ${pkg.total_credits || (pkg.credits + pkg.bonus_credits)} credits`,
          order_id: order.order_id,
          handler: async (resp: any) => {
            await api.post('/owner/credits/verify', resp);
            toast.success('Credits added to wallet!');
            setTimeout(() => window.location.reload(), 1000);
          },
        });
        rzp.open();
      } else {
        toast.error('Payment gateway not loaded. Please refresh.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start payment');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-4xl">Buy Credits</h1>
          <p className="text-ink-900/60 mt-1">Choose a package that fits your needs.</p>
        </div>
        <div className="px-5 py-3 bg-ink-900 text-cream rounded-xl">
          Current balance: <strong>{Number(wallet.balance).toLocaleString()}</strong> credits
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center mt-8">
          <p className="text-ink-900/50">No packages available yet. Contact admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {packages.map((pkg: any) => {
            const totalCredits = pkg.total_credits || (pkg.credits + (pkg.bonus_credits || 0));
            const pricePerCredit = (pkg.price_inr / totalCredits).toFixed(2);
            return (
              <div key={pkg.id} className={`relative p-8 rounded-3xl border-2 ${pkg.is_popular == 1 ? 'border-coral-500 bg-coral-50' : 'border-ink-900/10 bg-white'}`}>
                {pkg.is_popular == 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-coral-500 text-white text-xs font-bold uppercase tracking-wider">⭐ Most Popular</span>
                )}

                <h3 className="font-display font-bold text-2xl">{pkg.name}</h3>
                {pkg.description && <p className="text-sm text-ink-900/60 mt-1">{pkg.description}</p>}

                <div className="mt-6">
                  <div className="font-display font-black text-5xl text-ink-950">₹{Number(pkg.price_inr).toLocaleString()}</div>
                  <div className="text-sm text-ink-900/50 mt-1">one-time payment</div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-ink-950 text-cream">
                  <div className="text-xs uppercase tracking-wider text-cream/60">You get</div>
                  <div className="font-display font-bold text-3xl mt-1">{Number(totalCredits).toLocaleString()} credits</div>
                  {pkg.bonus_credits > 0 && (
                    <div className="text-xs text-coral-400 mt-1">{pkg.credits} base + <strong>{pkg.bonus_credits} bonus</strong></div>
                  )}
                  <div className="text-xs text-cream/50 mt-2">≈ ₹{pricePerCredit}/credit</div>
                </div>

                <button
                  onClick={() => buy(pkg)}
                  className={`block mt-6 w-full text-center py-4 rounded-xl font-bold ${
                    pkg.is_popular == 1 ? 'bg-coral-500 hover:bg-coral-600 text-white' : 'bg-ink-900 hover:bg-ink-800 text-cream'
                  }`}
                >
                  Buy now →
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200">
        <h3 className="font-display font-bold text-lg text-amber-900">💡 How credits work</h3>
        <ul className="text-sm text-amber-900/80 mt-3 space-y-1 list-disc pl-5">
          <li>Use credits to unlock leads and view contact details (phone, email).</li>
          <li>Different lead types cost different credits — check pricing on the leads page.</li>
          <li>Credits never expire. Buy once, use anytime.</li>
          <li>Payment is secured by Razorpay (UPI, Cards, Net Banking).</li>
        </ul>
      </div>
    </div>
  );
}
