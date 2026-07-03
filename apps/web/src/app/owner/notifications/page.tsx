'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function OwnerNotifications() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/user/notifications')).data.data,
  });

  const markAllRead = async () => {
    try {
      await api.patch('/user/notifications/read-all');
      toast.success('All marked as read');
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-notifs'] });
    } catch { toast.error('Failed'); }
  };

  const unread = data?.filter((n: any) => !n.read_at).length || 0;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-4xl text-ink-950">Notifications</h1>
          <p className="text-ink-700 mt-1">{unread} unread</p>
        </div>
        {unread > 0 && <button onClick={markAllRead} className="btn-secondary text-sm">Mark all as read</button>}
      </div>

      {isLoading ? (
        <div className="text-center py-10 mt-6">Loading...</div>
      ) : data?.length === 0 ? (
        <div className="card text-center py-10 mt-6">
          <div className="text-5xl mb-3">🔔</div>
          <p className="font-bold">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {data?.map((n: any) => {
            const dataObj = typeof n.data === 'string' ? JSON.parse(n.data || '{}') : n.data;
            return (
              <div key={n.id} className={`card ${!n.read_at ? 'border-l-4 border-l-coral-500' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-bold capitalize">
                      {dataObj?.title || n.type?.split('\\').pop()?.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <p className="text-sm text-ink-700 mt-1">{dataObj?.message || dataObj?.body || ''}</p>
                  </div>
                  <span className="text-xs text-ink-500 flex-shrink-0">
                    {n.created_at && new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
