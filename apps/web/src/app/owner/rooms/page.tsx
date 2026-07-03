'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';

export default function OwnerRooms() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  const { data: properties } = useQuery({
    queryKey: ['owner-properties'],
    queryFn: async () => (await api.get('/owner/properties')).data.data,
  });

  useEffect(() => {
    if (properties?.length && !selectedPropertyId) setSelectedPropertyId(String(properties[0].id));
  }, [properties]);

  const { data, isLoading } = useQuery({
    queryKey: ['owner-rooms', selectedPropertyId],
    queryFn: async () => (await api.get('/owner/rooms', { params: { property_id: selectedPropertyId } })).data.data,
    enabled: !!selectedPropertyId,
  });

  const stats = data?.stats || { total_rooms: 0, total_beds: 0, occupied: 0, vacant: 0 };
  const rooms = data?.rooms || data || [];
  const roomsList = Array.isArray(rooms) ? rooms : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">🛏️ Rooms & Beds</h1>
          <p className="text-ink-900/60 mt-1">Manage room inventory and bed allocations</p>
        </div>
        <Link href={`/owner/rooms/new?property_id=${selectedPropertyId}`} className="px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-coral-500/30">+ Add Room</Link>
      </div>

      {properties?.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">🏠</div>
          <p className="text-ink-900/70 mb-4">Add a property first to manage rooms.</p>
          <Link href="/owner/properties/new" className="inline-block px-5 py-3 bg-coral-500 text-white rounded-xl font-bold">+ Add Property</Link>
        </div>
      ) : (
        <>
          {/* Property Selector */}
          <div className="bg-white rounded-xl border border-ink-900/10 p-2 mb-4 flex gap-1 overflow-x-auto">
            {properties?.map((p: any) => (
              <button
                key={p.id}
                onClick={() => setSelectedPropertyId(String(p.id))}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${
                  String(selectedPropertyId) === String(p.id) ? 'bg-coral-500 text-white' : 'text-ink-900/70 hover:bg-cream'
                }`}
              >
                🏠 {p.name} ({p.total_rooms || 0} rooms)
              </button>
            ))}
          </div>

          {selectedPropertyId && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-ink-900/10">
                  <div className="text-xs text-ink-900/50 uppercase font-bold">Total Rooms</div>
                  <div className="font-display font-black text-3xl mt-1">{stats.total_rooms}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-blue-200">
                  <div className="text-xs text-blue-700 uppercase font-bold">Total Beds</div>
                  <div className="font-display font-black text-3xl text-blue-700 mt-1">{stats.total_beds}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-rose-200">
                  <div className="text-xs text-rose-700 uppercase font-bold">Occupied</div>
                  <div className="font-display font-black text-3xl text-rose-700 mt-1">{stats.occupied}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-emerald-200">
                  <div className="text-xs text-emerald-700 uppercase font-bold">Vacant</div>
                  <div className="font-display font-black text-3xl text-emerald-700 mt-1">{stats.vacant}</div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">Loading...</div>
              ) : roomsList.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
                  <div className="text-5xl mb-3">🛏️</div>
                  <p className="text-ink-900/70 mb-4">No rooms in this property yet.</p>
                  <Link href={`/owner/rooms/new?property_id=${selectedPropertyId}`} className="inline-block px-5 py-3 bg-coral-500 text-white rounded-xl font-bold">+ Add First Room</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roomsList.map((room: any) => {
                    const occCount = room.beds?.filter((b: any) => b.status === 'occupied').length || 0;
                    const totalBeds = room.beds?.length || 0;
                    const occPercent = totalBeds > 0 ? Math.round((occCount / totalBeds) * 100) : 0;
                    return (
                      <Link key={room.id} href={`/owner/rooms/${room.id}`} className="bg-white rounded-2xl border border-ink-900/10 hover:border-coral-300 transition overflow-hidden block">
                        <div className="p-4 border-b border-ink-900/10">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="font-display font-bold text-xl">Room {room.room_number}</h3>
                            <span className="text-xs bg-cream px-2 py-0.5 rounded-full font-bold capitalize">{room.room_type}</span>
                          </div>
                          {room.floor && <div className="text-xs text-ink-900/50 mt-1">Floor: {room.floor}</div>}
                          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                            {room.has_ac == 1 && <span>❄️ AC</span>}
                            {room.has_attached_bathroom == 1 && <span>🚿</span>}
                            {room.has_balcony == 1 && <span>🌿</span>}
                            {room.has_wifi == 1 && <span>📶</span>}
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-ink-900/70">Occupancy</span>
                            <span className="font-bold">{occCount}/{totalBeds}</span>
                          </div>
                          <div className="w-full bg-ink-900/10 rounded-full h-2">
                            <div className="bg-gradient-to-r from-emerald-500 to-coral-500 h-2 rounded-full" style={{ width: `${occPercent}%` }}></div>
                          </div>

                          {totalBeds > 0 && (
                            <div className="grid grid-cols-4 gap-1.5 mt-3">
                              {room.beds?.map((bed: any) => (
                                <div
                                  key={bed.id}
                                  title={`${bed.bed_number} - ${bed.status}`}
                                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                                    bed.status === 'occupied' ? 'bg-rose-100 text-rose-700' :
                                    bed.status === 'vacant' ? 'bg-emerald-100 text-emerald-700' :
                                    bed.status === 'reserved' ? 'bg-amber-100 text-amber-700' :
                                    'bg-ink-100 text-ink-900/70'
                                  }`}
                                >
                                  {bed.bed_number}
                                </div>
                              ))}
                            </div>
                          )}

                          {room.monthly_rent > 0 && (
                            <div className="mt-3 pt-3 border-t border-ink-900/10">
                              <span className="text-xs text-ink-900/50">Room Rent: </span>
                              <span className="font-bold text-coral-600">{formatINR(room.monthly_rent)}/mo</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
