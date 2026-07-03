'use client';

import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';

export default function AdminRent() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-rent'],
    queryFn: async () => (await api.get('/admin/rent')).data.data,
  });

  const totalPaid = data?.reduce((s: number, b: any) => s + parseFloat(b.paid_amount || 0), 0) || 0;
  const totalDue = data?.reduce((s: number, b: any) => s + parseFloat(b.due_amount || 0), 0) || 0;

  return (
    <div>
      <h1 className="font-display font-black text-3xl text-ink-950 mb-1">All Bills</h1>
      <p className="text-ink-700 mb-6">{data?.length || 0} bills · Total: {formatINR(totalPaid + totalDue)}</p>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card">
          <div className="text-xs text-emerald-700 uppercase font-bold">Total Collected</div>
          <div className="font-display font-black text-2xl text-emerald-700 mt-1">{formatINR(totalPaid)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-rose-700 uppercase font-bold">Total Pending</div>
          <div className="font-display font-black text-2xl text-rose-700 mt-1">{formatINR(totalDue)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-blue-700 uppercase font-bold">Total Bills</div>
          <div className="font-display font-black text-2xl text-blue-700 mt-1">{data?.length || 0}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-700 text-xs uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Bill #</th>
                  <th className="px-4 py-3 text-left">Tenant</th>
                  <th className="px-4 py-3 text-left">Property</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((b: any) => (
                  <tr key={b.id} className="border-t border-ink-100 hover:bg-cream">
                    <td className="px-4 py-3 font-mono text-xs">{b.bill_number}</td>
                    <td className="px-4 py-3 font-bold">{b.tenant_name}</td>
                    <td className="px-4 py-3 text-xs">{b.property_name}</td>
                    <td className="px-4 py-3 text-xs">{b.owner_name}</td>
                    <td className="px-4 py-3">{b.month}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatINR(b.total_amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge capitalize ${
                        b.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{b.status}</span>
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
