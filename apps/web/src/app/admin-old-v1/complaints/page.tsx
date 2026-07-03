'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminComplaints() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-complaints'],
    queryFn: async () => (await api.get('/admin/complaints')).data.data,
  });

  return (
    <div>
      <h1 className="font-display font-black text-3xl text-ink-950 mb-1">All Complaints</h1>
      <p className="text-ink-700 mb-6">{data?.length || 0} complaints platform-wide</p>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="space-y-3">
          {data?.map((c: any) => (
            <div key={c.id} className="card">
              <div className="flex justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge capitalize ${
                      c.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                      c.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                      'bg-ink-100 text-ink-700'
                    }`}>{c.priority}</span>
                    <span className="badge bg-coral-50 text-coral-700 capitalize">{c.category}</span>
                    <span className={`badge capitalize ${
                      c.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'open' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{c.status?.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg">{c.title}</h3>
                  {c.description && <p className="text-sm text-ink-700 mt-1">{c.description}</p>}
                  <p className="text-xs text-ink-500 mt-2">
                    By <strong>{c.tenant_name}</strong> · {c.property_name} · Owner: {c.owner_name} · #{c.ticket_number}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
