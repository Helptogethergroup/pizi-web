'use client';

import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';

export default function AdminTenants() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: async () => (await api.get('/admin/tenants')).data.data,
  });

  return (
    <div>
      <h1 className="font-display font-black text-3xl text-ink-950 mb-1">All Tenants</h1>
      <p className="text-ink-700 mb-6">{data?.length || 0} tenants across all properties</p>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-700 text-xs uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Property</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-right">Rent</th>
                  <th className="px-4 py-3 text-center">KYC</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((t: any) => (
                  <tr key={t.id} className="border-t border-ink-100 hover:bg-cream">
                    <td className="px-4 py-3 font-bold">{t.name}</td>
                    <td className="px-4 py-3">{t.phone}</td>
                    <td className="px-4 py-3 text-xs">{t.property_name}</td>
                    <td className="px-4 py-3 text-xs">{t.owner_name}</td>
                    <td className="px-4 py-3 text-right font-bold text-coral-500">{formatINR(t.monthly_rent)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge capitalize ${
                        t.kyc_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        t.kyc_status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{t.kyc_status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge capitalize ${
                        t.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-700'
                      }`}>{t.status?.replace('_', ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
