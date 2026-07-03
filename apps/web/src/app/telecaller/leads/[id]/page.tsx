'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, imageUrl, formatINR } from '@/lib/api';

export default function TelecallerLeadDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const qc = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['telecaller-lead', id],
    queryFn: async () => (await api.get(`/telecaller/leads/${id}`)).data.data,
  });

  const { data: matching, refetch: refetchMatching } = useQuery({
    queryKey: ['telecaller-lead-matches', id],
    queryFn: async () => (await api.get(`/telecaller/leads/${id}/matching`)).data.data,
  });

  const { data: fieldExecs } = useQuery({
    queryKey: ['field-execs'],
    queryFn: async () => (await api.get('/admin/users', { params: { role: 'field_executive' } })).data.data,
  });

  const [form, setForm] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<string>('');
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (lead) {
      setForm({
        status: lead.status || 'new',
        preferred_locality: lead.preferred_locality || '',
        preferred_city: lead.preferred_city || '',
        budget_min: lead.budget_min || '',
        budget_max: lead.budget_max || '',
        preferred_gender: lead.preferred_gender || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  const debouncedSave = (next: any) => {
    setSaveStatus('⏳ Saving...');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await api.patch(`/telecaller/leads/${id}`, next);
        setSaveStatus('✓ Saved · matches updated');
        refetchMatching();
        setTimeout(() => setSaveStatus(''), 2000);
      } catch {
        setSaveStatus('⚠️ Save failed');
      }
    }, 600);
  };

  const update = (field: string, value: any) => {
    const next = { ...form, [field]: value };
    setForm(next);
    debouncedSave(next);
  };

  const matches = matching || [];

  if (isLoading || !lead) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/telecaller/leads" className="text-2xl">←</Link>
        <div>
          <h1 className="font-display font-black text-2xl">{lead.name}</h1>
          <p className="text-xs text-ink-900/60">
            Lead #{lead.id} · {(lead.source || 'website').charAt(0).toUpperCase() + (lead.source || 'website').slice(1)} · {lead.created_at && new Date(lead.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Lead info + edit form */}
        <div className="space-y-4">
          {/* Quick contact */}
          <div className="bg-white p-5 rounded-2xl border border-ink-900/10">
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${lead.phone}`} className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-bold">📞 Call</a>
              <a href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold">💬 WhatsApp</a>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <div className="text-xs text-ink-900/50 uppercase">Phone</div>
                <div className="font-bold">{lead.phone}</div>
              </div>
              <div>
                <div className="text-xs text-ink-900/50 uppercase">Email</div>
                <div className="font-bold">{lead.email || '—'}</div>
              </div>
            </div>
          </div>

          {/* Edit form (live updates) */}
          <div className="bg-white p-5 rounded-2xl border border-ink-900/10">
            <h3 className="font-display font-bold text-lg mb-3">📝 Live update preferences</h3>
            <p className="text-xs text-ink-900/60 mb-4">Change budget or area — matching properties on the right update instantly.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-ink-900/60 uppercase">Status</label>
                <select value={form.status || ''} onChange={(e) => update('status', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-900/15">
                  {[
                    ['new', 'New'], ['contacted', 'Contacted'], ['interested', 'Interested'],
                    ['follow_up', 'Follow up'], ['visit_scheduled', 'Visit scheduled'], ['visit_done', 'Visit done'],
                    ['closed_won', '✓ Closed Won'], ['closed_lost', '✗ Closed Lost'], ['not_interested', 'Not interested'],
                  ].map(([k, l]) => (
                    <option key={k} value={k}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink-900/60 uppercase">📍 Preferred Locality</label>
                <input value={form.preferred_locality || ''} onChange={(e) => update('preferred_locality', e.target.value)} placeholder="e.g. Mukherjee Nagar" className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-900/15" />
              </div>

              <div>
                <label className="text-xs font-bold text-ink-900/60 uppercase">🏙 Preferred City</label>
                <input value={form.preferred_city || ''} onChange={(e) => update('preferred_city', e.target.value)} placeholder="e.g. Delhi" className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-900/15" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-ink-900/60 uppercase">💰 Budget Min</label>
                  <input type="number" value={form.budget_min || ''} onChange={(e) => update('budget_min', e.target.value)} placeholder="6000" className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-900/15" />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-900/60 uppercase">💰 Budget Max</label>
                  <input type="number" value={form.budget_max || ''} onChange={(e) => update('budget_max', e.target.value)} placeholder="10000" className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-900/15" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink-900/60 uppercase">👤 Gender preference</label>
                <select value={form.preferred_gender || ''} onChange={(e) => update('preferred_gender', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-900/15">
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unisex">Unisex / No preference</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink-900/60 uppercase">📝 Notes</label>
                <textarea rows={3} value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} placeholder="Tenant feedback, preferences, follow-up info..." className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-900/15" />
              </div>
            </div>

            <div className={`text-xs mt-3 h-4 font-bold ${saveStatus.includes('✓') ? 'text-emerald-600' : saveStatus.includes('⚠️') ? 'text-rose-600' : 'text-ink-900/60'}`}>{saveStatus}</div>
          </div>

          {/* Schedule visit */}
          <ScheduleVisitCard leadId={Number(id)} matchingProperties={matches} fieldExecs={fieldExecs || []} onSuccess={() => qc.invalidateQueries({ queryKey: ['telecaller-lead', id] })} />
        </div>

        {/* RIGHT: Live matching properties */}
        <div>
          <div className="bg-cream p-5 rounded-2xl sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg">🎯 Matching Properties</h3>
              <span className="text-xs text-ink-900/60">{matches.length} matches</span>
            </div>
            <p className="text-xs text-ink-900/60 mb-4">Live results based on lead's current budget + area. Send via WhatsApp instantly.</p>

            {matches.length === 0 ? (
              <div className="p-8 text-center text-ink-900/50">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-sm font-semibold">No matching properties found.</p>
                <p className="text-xs mt-1">Try changing budget or area on the left.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {matches.map((p: any) => (
                  <div key={p.id} className="bg-white border border-ink-900/10 rounded-xl p-3 flex items-start gap-3 hover:border-coral-500 transition">
                    {p.cover_image ? (
                      <img src={imageUrl(p.cover_image) || ''} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-ink-900/10 flex items-center justify-center flex-shrink-0 text-2xl">🏠</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold truncate">{p.name}</div>
                      <div className="text-xs text-ink-900/60 truncate">📍 {p.locality_name || p.locality?.name}, {p.city_name || p.city?.name}</div>
                      <div className="text-sm font-bold mt-1">{formatINR(p.rent_min)}–{formatINR(p.rent_max)}/mo</div>
                      <div className="text-xs text-ink-900/50 capitalize">{p.gender} · {(p.property_type || 'pg').replace('_', ' ')}</div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <a href={`/property/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 border border-ink-900/15 rounded text-center hover:bg-cream">👁 View</a>
                      <a
                        href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, check out ${p.name} at ${p.locality_name || ''}, ${formatINR(p.rent_min)}-${formatINR(p.rent_max)}/mo. More: ${typeof window !== 'undefined' ? window.location.origin : ''}/property/${p.slug}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs px-2 py-1 bg-emerald-500 text-white rounded text-center"
                      >
                        💬 WA
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleVisitCard({ leadId, matchingProperties, fieldExecs, onSuccess }: any) {
  const [propertyId, setPropertyId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [feId, setFeId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/telecaller/leads/${leadId}/visit`, {
        property_id: propertyId,
        scheduled_at: scheduledAt,
        field_executive_id: feId || null,
      });
      toast.success('Visit scheduled');
      onSuccess?.();
      setPropertyId(''); setScheduledAt(''); setFeId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-ink-900/10">
      <h3 className="font-display font-bold text-lg mb-3">📅 Schedule site visit</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs font-bold text-ink-900/60 uppercase">Property</label>
          <select required value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-900/15">
            <option value="">Select property...</option>
            {matchingProperties.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} — {p.locality_name || p.locality?.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-ink-900/60 uppercase">Date & time</label>
          <input type="datetime-local" required value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-900/15" />
        </div>
        <div>
          <label className="text-xs font-bold text-ink-900/60 uppercase">Field Executive</label>
          <select value={feId} onChange={(e) => setFeId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-900/15">
            <option value="">— Auto-assign —</option>
            {fieldExecs.map((fe: any) => (
              <option key={fe.id} value={fe.id}>{fe.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={submitting} className="w-full py-2.5 bg-coral-500 text-white rounded-lg font-bold disabled:opacity-50">
          {submitting ? 'Scheduling...' : 'Schedule visit'}
        </button>
      </form>
    </div>
  );
}
