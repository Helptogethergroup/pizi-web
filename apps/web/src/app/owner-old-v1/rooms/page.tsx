'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, formatINR } from '@/lib/api';

export default function OwnerRooms() {
  const [addModal, setAddModal] = useState(false);
  const qc = useQueryClient();

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['owner-rooms'],
    queryFn: async () => (await api.get('/owner/rooms')).data.data,
  });

  const updateBedStatus = async (bedId: number, status: string) => {
    try {
      await api.patch(`/owner/beds/${bedId}/status`, { status });
      toast.success('Bed updated');
      qc.invalidateQueries({ queryKey: ['owner-rooms'] });
    } catch { toast.error('Failed'); }
  };

  const unassignBed = async (bedId: number) => {
    if (!confirm('Unassign tenant from this bed?')) return;
    try {
      await api.patch(`/owner/beds/${bedId}/unassign`);
      toast.success('Bed vacated');
      qc.invalidateQueries({ queryKey: ['owner-rooms'] });
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-ink-950">Rooms & Beds</h1>
          <p className="text-ink-700 mt-1">{rooms?.length || 0} rooms total</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary">+ Add Room</button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : rooms?.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-5xl mb-3">🛏️</div>
          <p className="font-bold">No rooms yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rooms?.map((r: any) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-xl">Room {r.room_number}</h3>
                  <p className="text-xs text-ink-700">{r.property_name} {r.floor && `· Floor ${r.floor}`}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ink-500 uppercase font-bold">Type</div>
                  <div className="font-bold capitalize">{r.room_type}</div>
                </div>
              </div>

              <div className="flex gap-2 text-xs mb-4 flex-wrap">
                {r.has_ac == 1 && <span className="badge bg-blue-100 text-blue-700">❄️ AC</span>}
                {r.has_attached_bathroom == 1 && <span className="badge bg-violet-100 text-violet-700">🚿 Attached</span>}
                {r.has_balcony == 1 && <span className="badge bg-emerald-100 text-emerald-700">🌿 Balcony</span>}
                {r.has_geyser == 1 && <span className="badge bg-amber-100 text-amber-700">♨️ Geyser</span>}
                {r.has_wifi == 1 && <span className="badge bg-coral-100 text-coral-700">📶 WiFi</span>}
              </div>

              <div className="flex justify-between text-sm mb-3 pb-3 border-b border-ink-100">
                <span className="text-ink-700">Monthly Rent</span>
                <span className="font-bold text-coral-500">{formatINR(r.monthly_rent)}</span>
              </div>

              {/* Beds */}
              <div className="mt-2">
                <div className="text-xs text-ink-500 uppercase font-bold mb-2">
                  Beds ({r.occupied_beds || 0}/{r.total_beds || 0} occupied)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {r.beds?.map((b: any) => (
                    <div key={b.id} className={`p-3 rounded-lg border ${
                      b.status === 'occupied' ? 'bg-emerald-50 border-emerald-200' :
                      b.status === 'vacant' ? 'bg-cream border-ink-200' :
                      'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">Bed {b.bed_number}</span>
                        <span className={`text-xs font-bold capitalize ${
                          b.status === 'occupied' ? 'text-emerald-700' :
                          b.status === 'vacant' ? 'text-ink-700' :
                          'text-amber-700'
                        }`}>{b.status}</span>
                      </div>
                      <div className="text-xs text-ink-700 mt-1">{formatINR(b.monthly_rent)}/mo</div>
                      {b.status === 'occupied' && b.tenant_id && (
                        <button onClick={() => unassignBed(b.id)} className="text-xs text-rose-600 font-bold mt-1 hover:underline">Vacate →</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addModal && <AddRoomModal onClose={() => setAddModal(false)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['owner-rooms'] }); setAddModal(false); }} />}
    </div>
  );
}

function AddRoomModal({ onClose, onSuccess }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    property_id: '',
    room_number: '',
    floor: '',
    room_type: 'double',
    monthly_rent: '',
    has_ac: false, has_attached_bathroom: false, has_balcony: false, has_geyser: false, has_wifi: true,
  });

  const { data: properties } = useQuery({
    queryKey: ['owner-properties'],
    queryFn: async () => (await api.get('/owner/properties')).data.data,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/owner/rooms', form);
      toast.success('Room added with beds');
      onSuccess();
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="font-display font-bold text-2xl mb-4">Add Room</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Property *</label>
            <select required value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })} className="input">
              <option value="">Select property</option>
              {properties?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Room Number *</label>
              <input required value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Floor</label>
              <input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} placeholder="Ground / 1st / 2nd" className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Room Type *</label>
              <select value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })} className="input">
                <option value="single">Single (1 bed)</option>
                <option value="double">Double (2 beds)</option>
                <option value="triple">Triple (3 beds)</option>
                <option value="quad">Quad (4 beds)</option>
                <option value="quint">Quint (5 beds)</option>
                <option value="dorm">Dorm</option>
              </select>
            </div>
            <div>
              <label className="label">Rent (₹) *</label>
              <input required type="number" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Amenities</label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['has_ac', '❄️ AC'],
                ['has_attached_bathroom', '🚿 Attached Bathroom'],
                ['has_balcony', '🌿 Balcony'],
                ['has_geyser', '♨️ Geyser'],
                ['has_wifi', '📶 WiFi'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 p-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
