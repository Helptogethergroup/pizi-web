'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function FieldDashboard() {
  const user = useAuth((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['field-dashboard'],
    queryFn: async () => (await api.get('/field/dashboard')).data.data,
  });

  const stats = data?.stats || { today_count: 0, today_completed: 0, pending_total: 0, completed_total: 0 };
  const todayVisits = data?.today_visits || [];
  const upcomingVisits = data?.upcoming_visits || [];

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">Hi, {user?.name} 👋</h1>
        <p className="text-ink-900/60 mt-1">Your visits and verification tasks</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-ink-900/10">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-xs text-ink-900/60 uppercase font-bold">Today's Visits</div>
          <div className="font-display font-black text-3xl mt-1">{isLoading ? '...' : stats.today_count}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-xs text-emerald-700 uppercase font-bold">Today Completed</div>
          <div className="font-display font-black text-3xl text-emerald-700 mt-1">{isLoading ? '...' : stats.today_completed}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-xs text-amber-700 uppercase font-bold">Pending Total</div>
          <div className="font-display font-black text-3xl text-amber-700 mt-1">{isLoading ? '...' : stats.pending_total}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-coral-200">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-xs text-coral-700 uppercase font-bold">Total Done</div>
          <div className="font-display font-black text-3xl text-coral-700 mt-1">{isLoading ? '...' : stats.completed_total}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/10 mb-6">
        <div className="p-5 border-b border-ink-900/10 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl">📅 Today's Schedule</h2>
          <span className="text-sm text-ink-900/60">{todayStr}</span>
        </div>

        {todayVisits.length === 0 ? (
          <div className="p-8 text-center text-ink-900/50">
            <div className="text-5xl mb-3">🎉</div>
            <p>No visits today. Enjoy your day!</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-900/10">
            {todayVisits.map((visit: any) => (
              <Link key={visit.id} href={`/field/visits/${visit.id}`} className="block p-5 hover:bg-cream transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        visit.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        visit.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                        visit.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {visit.status?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-ink-900/50 capitalize">{(visit.visit_type || '').replace('_', ' ')}</span>
                    </div>
                    <h3 className="font-bold text-lg">{visit.property?.name || visit.property_name}</h3>
                    <p className="text-sm text-ink-900/70 mt-1">📍 {visit.property?.locality?.name || visit.locality_name}, {visit.property?.city?.name || visit.city_name}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="text-xs text-ink-900/50 uppercase font-bold">Time</div>
                    <div className="font-bold">{visit.scheduled_at && new Date(visit.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {upcomingVisits.length > 0 && (
        <div className="bg-white rounded-2xl border border-ink-900/10">
          <div className="p-5 border-b border-ink-900/10">
            <h2 className="font-display font-bold text-xl">📆 Upcoming</h2>
          </div>
          <div className="divide-y divide-ink-900/10">
            {upcomingVisits.map((visit: any) => (
              <Link key={visit.id} href={`/field/visits/${visit.id}`} className="block p-4 hover:bg-cream transition">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{visit.property?.name || visit.property_name}</h3>
                    <p className="text-sm text-ink-900/70">📍 {visit.property?.locality?.name || visit.locality_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{visit.scheduled_at && new Date(visit.scheduled_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                    <div className="text-xs text-ink-900/50">{visit.scheduled_at && new Date(visit.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
