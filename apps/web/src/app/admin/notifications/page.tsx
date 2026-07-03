'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminNotifications() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/user/notifications')).data.data,
  });

  return (
    <div>
      <h1 className="font-display font-black text-4xl text-ink-950">Notifications</h1>
      <p className="text-ink-700 mt-1">All system notifications</p>

      {isLoading ? (
        <div className="text-center py-10 mt-6">Loading...</div>
      ) : data?.length === 0 ? (
        <div className="card text-center py-10 mt-6">
          <div className="text-5xl mb-3">🔔</div>
          <p className="font-bold">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {data?.map((n: any) => (
            <div key={n.id} className={`card ${!n.read_at ? 'border-l-4 border-l-coral-500' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold capitalize">{n.type?.split('\\').pop()?.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <pre className="text-xs text-ink-700 mt-1 whitespace-pre-wrap">{typeof n.data === 'string' ? n.data : JSON.stringify(n.data, null, 2)}</pre>
                </div>
                <span className="text-xs text-ink-500">{n.created_at && new Date(n.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
