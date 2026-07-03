'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, imageUrl, formatINR } from '@/lib/api';

export default function FieldVisitDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const qc = useQueryClient();

  const { data: visit, isLoading } = useQuery({
    queryKey: ['field-visit', id],
    queryFn: async () => (await api.get(`/field/visits/${id}`)).data.data,
  });

  const [checklist, setChecklist] = useState<any>({});
  const [remarks, setRemarks] = useState('');
  const [media, setMedia] = useState<FileList | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  useState(() => {
    if (visit) {
      setChecklist({
        address_verified: visit.address_verified == 1,
        amenities_verified: visit.amenities_verified == 1,
        rooms_verified: visit.rooms_verified == 1,
        safety_verified: visit.safety_verified == 1,
      });
      setRemarks(visit.remarks || '');
    }
  });

  const getLocation = (cb: (lat: number | null, lng: number | null) => void) => {
    if (!navigator.geolocation) { cb(null, null); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => cb(p.coords.latitude, p.coords.longitude),
      () => {
        if (confirm('Could not get GPS. Continue without?')) cb(null, null);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const startVisit = () => {
    getLocation(async (lat, lng) => {
      try {
        await api.post(`/field/visits/${id}/start`, { lat, lng });
        toast.success('Visit started');
        qc.invalidateQueries({ queryKey: ['field-visit', id] });
      } catch { toast.error('Failed'); }
    });
  };

  const completeVisit = () => {
    getLocation(async (lat, lng) => {
      try {
        await api.post(`/field/visits/${id}/complete`, { lat, lng });
        toast.success('Visit completed!');
        qc.invalidateQueries({ queryKey: ['field-visit', id] });
      } catch { toast.error('Failed'); }
    });
  };

  const saveChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/field/visits/${id}/verify`, { ...checklist, remarks });
      toast.success('Checklist saved');
      qc.invalidateQueries({ queryKey: ['field-visit', id] });
    } catch { toast.error('Failed'); }
  };

  const uploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!media || media.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(media).forEach((f) => fd.append('media[]', f));
    if (caption) fd.append('caption', caption);
    try {
      await api.post(`/field/visits/${id}/media`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Uploaded');
      setMedia(null); setCaption('');
      qc.invalidateQueries({ queryKey: ['field-visit', id] });
    } catch { toast.error('Failed'); } finally { setUploading(false); }
  };

  if (isLoading || !visit) {
    return <div className="text-center py-20">Loading...</div>;
  }

  const progress = visit.verification_progress || 0;
  const checklistItems: any[] = [
    { field: 'address_verified', label: '📍 Address Verified', desc: 'Address matches property location' },
    { field: 'amenities_verified', label: '✨ Amenities Verified', desc: 'All listed amenities are present' },
    { field: 'rooms_verified', label: '🛏️ Rooms Verified', desc: 'Room types and counts match' },
    { field: 'safety_verified', label: '🛡️ Safety Verified', desc: 'Fire safety, CCTV, locks proper' },
  ];

  return (
    <div>
      <div className="mb-6">
        <Link href="/field/visits" className="text-sm text-coral-500 font-bold">← Back to visits</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-white p-6 rounded-2xl border border-ink-900/10">
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
              visit.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
              visit.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
              visit.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {visit.status?.replace('_', ' ')}
            </span>
            <h1 className="font-display font-black text-2xl mt-3">{visit.property?.name}</h1>
            <p className="text-ink-900/70 mt-1">📍 {visit.property?.address_line}, {visit.property?.locality?.name}, {visit.property?.city?.name}</p>

            {visit.property?.google_map_link && (
              <a href={visit.property.google_map_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold">🧭 Get Directions</a>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-ink-900/10">
              <div>
                <div className="text-xs text-ink-900/50 uppercase font-bold">Scheduled</div>
                <div className="font-bold">{visit.scheduled_at && new Date(visit.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
              </div>
              {visit.started_at && (
                <div>
                  <div className="text-xs text-ink-900/50 uppercase font-bold">Started</div>
                  <div className="font-bold">{new Date(visit.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                </div>
              )}
              {visit.completed_at && (
                <div>
                  <div className="text-xs text-emerald-700 uppercase font-bold">Completed</div>
                  <div className="font-bold text-emerald-700">{new Date(visit.completed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                </div>
              )}
            </div>
          </div>

          {/* Start Visit */}
          {visit.status === 'scheduled' && (
            <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-2xl">
              <h3 className="font-bold text-lg text-amber-900">⏳ Ready to start?</h3>
              <p className="text-sm text-amber-800 mt-1 mb-4">Click below to check-in. Your GPS location will be recorded.</p>
              <button onClick={startVisit} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg">
                🚀 Check-in & Start Visit
              </button>
            </div>
          )}

          {/* Verification + Media (only for in_progress/completed) */}
          {(visit.status === 'in_progress' || visit.status === 'completed') && (
            <>
              <div className="bg-white p-6 rounded-2xl border border-ink-900/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-xl">✓ Verification Checklist</h2>
                  <div className="text-sm font-bold text-emerald-700">{progress}%</div>
                </div>

                <div className="w-full bg-ink-900/10 rounded-full h-2 mb-5">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                </div>

                <form onSubmit={saveChecklist} className="space-y-3">
                  {checklistItems.map((it) => (
                    <label key={it.field} className="flex items-start gap-3 p-3 rounded-xl border border-ink-900/10 cursor-pointer hover:bg-cream">
                      <input
                        type="checkbox"
                        checked={checklist[it.field] || false}
                        disabled={visit.status === 'completed'}
                        onChange={(e) => setChecklist({ ...checklist, [it.field]: e.target.checked })}
                        className="mt-1 rounded w-5 h-5"
                      />
                      <div>
                        <div className="font-bold">{it.label}</div>
                        <div className="text-xs text-ink-900/70">{it.desc}</div>
                      </div>
                    </label>
                  ))}

                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    placeholder="Remarks..."
                    readOnly={visit.status === 'completed'}
                    className="w-full px-4 py-3 rounded-xl border border-ink-900/15"
                  />

                  {visit.status !== 'completed' && (
                    <button type="submit" className="px-5 py-2.5 bg-ink-950 text-cream rounded-xl font-bold text-sm">💾 Save Checklist</button>
                  )}
                </form>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-ink-900/10">
                <h2 className="font-display font-bold text-xl mb-4">📸 Photos & Videos</h2>

                {visit.status !== 'completed' && (
                  <form onSubmit={uploadMedia} className="space-y-3 mb-5">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      capture="environment"
                      onChange={(e) => setMedia(e.target.files)}
                      className="w-full text-sm"
                      required
                    />
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Caption (optional)"
                      className="w-full px-4 py-2 rounded-xl border border-ink-900/15 text-sm"
                    />
                    <button type="submit" disabled={uploading} className="px-5 py-2.5 bg-coral-500 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                      {uploading ? 'Uploading...' : '📤 Upload'}
                    </button>
                  </form>
                )}

                {(visit.media || []).length === 0 ? (
                  <p className="text-sm text-ink-900/50">No media uploaded.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {visit.media?.map((m: any) => (
                      <div key={m.id} className="rounded-xl overflow-hidden border border-ink-900/10">
                        {m.media_type === 'photo' || m.media_type === 'image' ? (
                          <img src={imageUrl(m.url || m.file_path) || ''} alt="" className="w-full aspect-square object-cover" />
                        ) : (
                          <video src={imageUrl(m.url || m.file_path) || ''} controls className="w-full aspect-square object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Complete */}
          {visit.status === 'in_progress' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl">
              <h3 className="font-bold text-lg text-emerald-900">✅ Done with the visit?</h3>
              <button onClick={completeVisit} className="mt-4 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg">
                🏁 Check-out & Complete Visit
              </button>
            </div>
          )}

          {visit.status === 'completed' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl text-center">
              <div className="text-5xl mb-2">🎉</div>
              <h3 className="font-bold text-lg text-emerald-900">Visit Completed</h3>
              <p className="text-sm text-emerald-800 mt-1">Great work! Submitted on {visit.completed_at && new Date(visit.completed_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            </div>
          )}
        </div>

        {/* Sidebar - Property Info */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 bg-white p-5 rounded-2xl border border-ink-900/10">
            <h3 className="font-display font-bold text-lg mb-3">🏠 Property Info</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-ink-900/50">Type:</span> <strong className="capitalize">{visit.property?.property_type}</strong></div>
              <div><span className="text-ink-900/50">Gender:</span> <strong className="capitalize">{visit.property?.gender}</strong></div>
              <div><span className="text-ink-900/50">Rent:</span> <strong>{formatINR(visit.property?.rent_min)}+</strong></div>
              <div><span className="text-ink-900/50">Rooms:</span> <strong>{visit.property?.total_rooms || '—'}</strong></div>
            </div>

            {(visit.property?.amenities || []).length > 0 && (
              <div className="mt-4 pt-4 border-t border-ink-900/10">
                <div className="text-xs font-bold uppercase text-ink-900/50 mb-2">Amenities</div>
                <div className="flex flex-wrap gap-1.5">
                  {visit.property?.amenities?.map((a: any) => (
                    <span key={a.id} className="px-2 py-0.5 rounded-full bg-cream text-xs">{a.icon || '✨'} {a.name}</span>
                  ))}
                </div>
              </div>
            )}

            {visit.assigned_by && (
              <div className="mt-4 pt-4 border-t border-ink-900/10 text-xs">
                Assigned by: <strong>{visit.assigned_by.name || visit.assigned_by_name}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
