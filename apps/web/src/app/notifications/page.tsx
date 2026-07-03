'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

function timeAgo(date: string) {
  if (!date) return '';
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifs, isLoading } = useQuery({
    queryKey: ['all-notifs'],
    queryFn: async () => (await api.get('/user/notifications')).data.data,
  });

  const markRead = async (id: string) => {
    try {
      await api.post(`/user/notifications/${id}/read`);
      qc.invalidateQueries({ queryKey: ['all-notifs'] });
      qc.invalidateQueries({ queryKey: ['unread-notifs'] });
    } catch {}
  };

  const list = notifs || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">🔔 Notifications</h1>
        <p className="text-ink-900/60 mt-1">Your alerts and updates</p>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">🔔</div>
          <h2 className="font-bold text-xl">No notifications yet</h2>
          <p className="text-ink-900/70 mt-2">You'll see new lead alerts, visit updates and more here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ink-900/10 divide-y divide-ink-900/5">
          {list.map((n: any) => {
            const data = n.data || n;
            return (
              <Link
                key={n.id}
                href={data.url || '#'}
                onClick={() => !n.read_at && markRead(n.id)}
                className={`flex items-start gap-3 p-4 hover:bg-cream ${!n.read_at ? 'bg-coral-50' : ''}`}
              >
                <div className="text-2xl">{data.icon || '🔔'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{data.title || 'Notification'}</div>
                  <div className="text-xs text-ink-900/60 mt-0.5">{data.message}</div>
                  <div className="text-xs text-ink-900/40 mt-1">{timeAgo(n.created_at)}</div>
                </div>
                {!n.read_at && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-coral-500 mt-2"></span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
