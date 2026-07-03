'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function OwnerLeads() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['owner-leads', tab],
    queryFn: async () => (await api.get('/owner/leads', { params: { tab } })).data.data,
  });

  const { data: walletData } = useQuery({
    queryKey: ['owner-wallet'],
    queryFn: async () => (await api.get('/owner/wallet')).data.data,
  });

  const leads = data?.leads || [];
  const counts = data?.counts || { all: 0, hot: 0, affordable: 0, unlocked: 0 };
  const pricing = data?.pricing || {};
  const balance = walletData?.balance || 0;

  const unlock = async (lead: any) => {
    if (!confirm(`Unlock this lead for ${lead.unlock_cost} credits?`)) return;
    try {
      await api.post(`/owner/leads/${lead.id}/unlock`);
      toast.success('Unlocked!');
      qc.invalidateQueries({ queryKey: ['owner-leads'] });
      qc.invalidateQueries({ queryKey: ['owner-wallet'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">Matched Leads</h1>
          <p className="text-ink-900/60 mt-1">Smart-matched to your properties by location, budget, and gender preference.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-ink-950 text-cream rounded-xl font-bold">
            🪙 {Number(balance).toLocaleString()} credits
          </div>
          <Link href="/owner/credits" className="px-4 py-2 bg-coral-500 text-white rounded-xl font-bold">+ Buy Credits</Link>
        </div>
      </div>

      {/* Pricing strip */}
      <div className="bg-white p-3 rounded-xl border border-ink-900/10 mb-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-xs font-bold text-ink-900/60 uppercase">Unlock cost:</span>
        <span className="px-3 py-1 rounded-full bg-cream"><strong>Direct:</strong> {pricing.direct?.credit_cost ?? 1} credits</span>
        <span className="px-3 py-1 rounded-full bg-cream"><strong>Verified:</strong> {pricing.verified?.credit_cost ?? 2} credits</span>
        <span className="px-3 py-1 rounded-full bg-cream"><strong>Converted:</strong> {pricing.converted?.credit_cost ?? 5} credits</span>
        <span className="px-3 py-1 rounded-full bg-cream"><strong>Manual:</strong> {pricing.manual?.credit_cost ?? 3} credits</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white p-1 rounded-2xl border border-ink-900/10 w-fit overflow-x-auto">
        {[
          { key: 'all', label: `All (${counts.all})`, cls: 'bg-ink-950 text-cream' },
          { key: 'hot', label: `🔥 Hot (${counts.hot})`, cls: 'bg-coral-500 text-white' },
          { key: 'affordable', label: `🪙 Affordable (${counts.affordable})`, cls: 'bg-emerald-500 text-white' },
          { key: 'unlocked', label: `✓ Unlocked (${counts.unlocked})`, cls: 'bg-blue-500 text-white' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${
              tab === t.key ? t.cls : 'text-ink-900/60 hover:bg-ink-900/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Lead cards */}
      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : leads.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="font-display font-bold text-xl">No leads in this tab</p>
          <p className="text-sm text-ink-900/60 mt-2">Check other tabs or wait for new leads to come in.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map((lead: any) => {
            const score = lead.match_score || 0;
            const tier = score >= 85 ? 'Hot Match' : score >= 70 ? 'Great Match' : score >= 50 ? 'Good Match' : 'Possible Match';
            const tierClass = score >= 85 ? 'bg-coral-500 text-white' : score >= 70 ? 'bg-orange-100 text-orange-800' : score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-700';
            const emoji = score >= 85 ? '🔥' : score >= 70 ? '⭐' : score >= 50 ? '✓' : '';

            return (
              <div key={lead.id} className={`bg-white p-5 rounded-2xl border-2 ${lead.area_match ? 'border-coral-500' : 'border-ink-900/10'}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display font-bold text-lg">{lead.name}</h3>
                      {lead.area_match && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-coral-500 text-white font-bold">📍 Your Area</span>
                      )}
                    </div>
                    <div className="text-xs text-ink-900/60">
                      {lead.matched_property?.name || lead.property_name || '—'} · {(lead.source || 'website').charAt(0).toUpperCase() + (lead.source || 'website').slice(1)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${tierClass}`}>{emoji} {tier}</span>
                    <div className="text-xs text-ink-900/50 mt-1">Score: {score}/100</div>
                  </div>
                </div>

                <div className="text-xs text-ink-900/60 mb-3">
                  📅 {lead.created_at && new Date(lead.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <div className="text-xs text-ink-900/50 uppercase">📍 Looking in</div>
                    <div className="font-semibold">{lead.preferred_locality || '—'}</div>
                    <div className="text-xs text-ink-900/60">{lead.preferred_city || ''}</div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-900/50 uppercase">💰 Budget</div>
                    <div className="font-semibold">
                      {lead.budget_max ? `₹${Number(lead.budget_min || 0).toLocaleString()}–${Number(lead.budget_max).toLocaleString()}` : '—'}
                    </div>
                  </div>
                </div>

                {lead.message && (
                  <div className="bg-cream p-3 rounded-lg text-sm mb-3">
                    <div className="text-xs text-ink-900/50 uppercase">Message</div>
                    <p className="italic text-ink-900/80 mt-1">"{lead.message.slice(0, 120)}{lead.message.length > 120 ? '...' : ''}"</p>
                  </div>
                )}

                {/* Contact */}
                <div className="border-t border-ink-900/5 pt-3">
                  {lead.is_unlocked == 1 ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-ink-900/50 uppercase">📞 Phone</div>
                          <a href={`tel:${lead.phone}`} className="font-bold text-emerald-700">{lead.phone}</a>
                        </div>
                        <div>
                          <div className="text-xs text-ink-900/50 uppercase">📧 Email</div>
                          <a href={`mailto:${lead.email}`} className="font-bold text-emerald-700 truncate block">{lead.email || '—'}</a>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <a href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold">💬 WhatsApp</a>
                        <a href={`tel:${lead.phone}`} className="flex-1 text-center py-2 bg-blue-500 text-white rounded-lg text-sm font-bold">📞 Call</a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <div className="text-xs text-ink-900/50 uppercase">📞 Phone</div>
                          <div className="font-mono text-ink-900/40">🔒 {lead.phone?.slice(0, 2)}XXXXXX{lead.phone?.slice(-2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-ink-900/50 uppercase">📧 Email</div>
                          <div className="font-mono text-ink-900/40 truncate">🔒 {lead.email ? `${lead.email.slice(0, 2)}XXX@${lead.email.split('@')[1]}` : '—'}</div>
                        </div>
                      </div>
                      {balance >= (lead.unlock_cost || 1) ? (
                        <button onClick={() => unlock(lead)} className="w-full py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-bold text-sm">
                          🔓 Unlock for {lead.unlock_cost || 1} credits
                        </button>
                      ) : (
                        <Link href="/owner/credits" className="block w-full text-center py-2.5 bg-amber-500 text-white rounded-lg font-bold text-sm">
                          💳 Recharge to unlock ({lead.unlock_cost || 1} credits needed)
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
