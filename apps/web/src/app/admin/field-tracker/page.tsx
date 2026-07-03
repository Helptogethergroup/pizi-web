'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function timeAgo(date: string) {
  if (!date) return '—';
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)} sec`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  return `${Math.floor(diff / 3600)} hr`;
}

export default function AdminFieldTracker() {
  const { data, isLoading } = useQuery({
    queryKey: ['field-tracker'],
    queryFn: async () => (await api.get('/admin/field-tracker')).data.data,
    refetchInterval: 30000,
  });

  const activeVisits = data?.active_visits || [];
  const execs = data?.execs || [];

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-3xl">Field Executive Tracker</h1>
          <p className="text-ink-900/60 mt-1">Live view of field operations · {todayStr}</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-ink-900 text-cream rounded-lg text-sm">🔄 Refresh</button>
      </div>

      {/* Active visits (live) */}
      {activeVisits.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="font-display font-bold text-xl">Live now ({activeVisits.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeVisits.map((v: any) => (
              <div key={v.id} className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-display font-bold text-lg">{v.field_executive?.name || v.exec_name}</div>
                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">⏱ Inside since {timeAgo(v.checked_in_at || v.started_at)}</div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-emerald-500 text-white font-bold">LIVE</span>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-200 text-sm">
                  <div className="text-xs text-ink-900/60 uppercase">Visiting</div>
                  <div className="font-semibold">{v.property?.name || v.property_name}</div>
                  <div className="text-xs text-ink-900/60">📍 {v.property?.locality?.name || v.locality_name}</div>
                </div>

                <div className="mt-2 text-sm">
                  <div className="text-xs text-ink-900/60 uppercase">With tenant</div>
                  <div className="font-semibold">{v.lead?.name || v.lead_name} · 📞 {v.lead?.phone || v.lead_phone}</div>
                </div>

                {v.checkin_distance_m != null && (
                  <div className="mt-2 text-xs">
                    {v.checkin_distance_m <= 100 ? (
                      <span className="text-emerald-700">✅ Checked in within {v.checkin_distance_m}m</span>
                    ) : (
                      <span className="text-rose-700">⚠️ Checked in {v.checkin_distance_m}m away</span>
                    )}
                  </div>
                )}

                {v.checkin_lat && v.checkin_lng && (
                  <a href={`https://www.google.com/maps?q=${v.checkin_lat},${v.checkin_lng}`} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs text-coral-600 font-semibold">
                    📍 View on Google Maps →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's exec performance */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-xl mb-3">Today's executive performance</h2>
        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : execs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
            <div className="text-5xl mb-3">🚗</div>
            <p className="text-ink-900/70">No field executives yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {execs.map((exec: any) => (
              <div key={exec.id} className="bg-white p-5 rounded-2xl border border-ink-900/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold text-lg">{exec.name}</div>
                    <div className="text-xs text-ink-900/60">📞 {exec.phone}</div>
                  </div>
                  {exec.today_total === 0 ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">No visits</span>
                  ) : exec.today_done >= exec.today_total ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">✓ Done</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">In progress</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="p-2 bg-ink-950 text-cream rounded text-center">
                    <div className="font-display font-black text-2xl">{exec.today_total || 0}</div>
                    <div className="text-xs opacity-70">Total</div>
                  </div>
                  <div className="p-2 bg-emerald-100 text-emerald-900 rounded text-center">
                    <div className="font-display font-black text-2xl">{exec.today_done || 0}</div>
                    <div className="text-xs">Done</div>
                  </div>
                  <div className="p-2 bg-coral-100 text-coral-900 rounded text-center">
                    <div className="font-display font-black text-2xl">{exec.today_closed || 0}</div>
                    <div className="text-xs">Closed</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
