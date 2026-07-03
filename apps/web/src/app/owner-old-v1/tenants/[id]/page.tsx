'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { api, formatINR } from '@/lib/api';

export default function TenantDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const qc = useQueryClient();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => (await api.get(`/owner/tenants/${id}`)).data.data,
    enabled: !!id,
  });

  const approveKyc = async () => {
    try {
      await api.patch(`/owner/tenants/${id}/kyc/approve`);
      toast.success('KYC approved!');
      qc.invalidateQueries({ queryKey: ['tenant', id] });
    } catch { toast.error('Failed'); }
  };

  const rejectKyc = async () => {
    const remarks = prompt('Reason for rejection?');
    if (!remarks) return;
    try {
      await api.patch(`/owner/tenants/${id}/kyc/reject`, { remarks });
      toast.success('KYC rejected');
      qc.invalidateQueries({ queryKey: ['tenant', id] });
    } catch { toast.error('Failed'); }
  };

  const deleteTenant = async () => {
    if (!confirm('Delete this tenant? This cannot be undone.')) return;
    try {
      await api.delete(`/owner/tenants/${id}`);
      toast.success('Tenant deleted');
      router.push('/owner/tenants');
    } catch { toast.error('Failed'); }
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (!tenant) return <div className="card text-center py-10">Tenant not found</div>;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <Link href="/owner/tenants" className="text-sm text-coral-500 font-bold">← Back</Link>
        <div className="flex items-start justify-between mt-2 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-black text-3xl text-ink-950">{tenant.name}</h1>
            <p className="text-ink-700 mt-1">📞 {tenant.phone} {tenant.email && `· ✉️ ${tenant.email}`}</p>
          </div>
          <div className="flex gap-2">
            {tenant.kyc_status === 'pending' || tenant.kyc_status === 'submitted' ? (
              <>
                <button onClick={approveKyc} className="btn-primary text-sm">✓ Approve KYC</button>
                <button onClick={rejectKyc} className="btn-secondary text-sm">✗ Reject</button>
              </>
            ) : null}
            <button onClick={deleteTenant} className="btn-secondary text-sm text-rose-600">Delete</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Tenant Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <h2 className="font-display font-bold text-xl mb-4">Tenant Details</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-ink-700">Property</div>
              <div className="font-bold text-right">{tenant.property?.name || '—'}</div>
              <div className="text-ink-700">Room / Bed</div>
              <div className="font-bold text-right">{tenant.room_number || '—'} / {tenant.bed_number || '—'}</div>
              <div className="text-ink-700">Monthly Rent</div>
              <div className="font-bold text-right text-coral-500">{formatINR(tenant.monthly_rent)}</div>
              <div className="text-ink-700">Security Deposit</div>
              <div className="font-bold text-right">{formatINR(tenant.security_deposit)}</div>
              <div className="text-ink-700">Move-in Date</div>
              <div className="font-bold text-right">{tenant.move_in_date || '—'}</div>
              <div className="text-ink-700">Occupation</div>
              <div className="font-bold text-right">{tenant.occupation || '—'}</div>
              <div className="text-ink-700">Status</div>
              <div className="font-bold text-right capitalize">{tenant.status?.replace('_', ' ')}</div>
            </div>
          </div>

          {/* Rent Bills */}
          <div className="card">
            <h2 className="font-display font-bold text-xl mb-4">Recent Bills ({tenant.bills?.length || 0})</h2>
            {tenant.bills?.length === 0 ? (
              <p className="text-ink-700 text-sm text-center py-4">No bills generated yet</p>
            ) : (
              <div className="space-y-2">
                {tenant.bills?.slice(0, 5).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                    <div>
                      <div className="font-bold text-sm">{b.month}</div>
                      <div className="text-xs text-ink-700">Bill {b.bill_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatINR(b.total_amount)}</div>
                      <span className={`text-xs font-bold ${b.status === 'paid' ? 'text-emerald-600' : b.status === 'partial' ? 'text-amber-600' : 'text-rose-600'}`}>
                        {b.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complaints */}
          <div className="card">
            <h2 className="font-display font-bold text-xl mb-4">Complaints ({tenant.complaints?.length || 0})</h2>
            {tenant.complaints?.length === 0 ? (
              <p className="text-ink-700 text-sm text-center py-4">No complaints</p>
            ) : (
              <div className="space-y-2">
                {tenant.complaints?.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="p-3 bg-cream rounded-lg">
                    <div className="flex justify-between">
                      <div className="font-bold text-sm">{c.title}</div>
                      <span className="text-xs badge bg-amber-100 text-amber-700">{c.status}</span>
                    </div>
                    <div className="text-xs text-ink-700 mt-1">#{c.ticket_number} · {c.category}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — KYC + Emergency */}
        <div className="space-y-5">
          {/* KYC Status */}
          <div className="card">
            <h3 className="font-bold text-ink-950 mb-3">KYC Status</h3>
            {tenant.kyc_status === 'approved' && <span className="badge bg-emerald-100 text-emerald-700">✓ Approved</span>}
            {tenant.kyc_status === 'pending' && <span className="badge bg-amber-100 text-amber-700">⏳ Pending</span>}
            {tenant.kyc_status === 'submitted' && <span className="badge bg-blue-100 text-blue-700">📋 Submitted</span>}
            {tenant.kyc_status === 'rejected' && (
              <>
                <span className="badge bg-rose-100 text-rose-700">✗ Rejected</span>
                {tenant.kyc_remarks && <p className="text-xs text-rose-700 mt-2">{tenant.kyc_remarks}</p>}
              </>
            )}
          </div>

          {/* Documents */}
          <div className="card">
            <h3 className="font-bold text-ink-950 mb-3">Documents ({tenant.documents?.length || 0})</h3>
            {tenant.documents?.length === 0 ? (
              <p className="text-ink-700 text-sm">No documents uploaded</p>
            ) : (
              <div className="space-y-2">
                {tenant.documents?.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-2 bg-cream rounded text-xs">
                    <span className="font-bold capitalize">{d.document_type?.replace('_', ' ')}</span>
                    <a href={`https://pizi.in/storage/${d.file_path}`} target="_blank" className="text-coral-500 font-bold">View →</a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency */}
          {tenant.emergency_name && (
            <div className="card bg-rose-50 border-rose-200">
              <h3 className="font-bold text-ink-950 mb-2">🚨 Emergency Contact</h3>
              <div className="text-sm">
                <div className="font-bold">{tenant.emergency_name}</div>
                <div>{tenant.emergency_phone}</div>
                <div className="text-xs text-ink-700">{tenant.emergency_relation}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
