'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, formatINR } from '@/lib/api';

export default function AdminRooms() {
  const [filter, setFilter] = useState({ q: '', owner_id: '', property_id: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rooms', filter],
    queryFn: async () => {
      const params: any = {};
      Object.entries(filter).forEach(([k, v]) => { if (v) params[k] = v; });
      return (await api.get('/admin/rooms', { params })).data.data;
    },
  });

  const { data: owners } = useQuery({
    queryKey: ['all-owners'],
    queryFn: async () => (await api.get('/admin/users', { params: { role: 'owner' } })).data.data,
  });

  const { data: properties } = useQuery({
    queryKey: ['all-properties'],
    queryFn: async () => (await api.get('/admin/properties')).data.data,
  });

  const stats = data?.stats || { total_rooms: 0, total_beds: 0, occupied: 0, vacant: 0 };
  const rooms = data?.rooms || data || [];
  const list = Array.isArray(rooms) ? rooms : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">🛏️ All Rooms & Beds</h1>
        <p className="text-ink-900/60 mt-1">Platform-wide room inventory</p>
      </div>

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

      <div className="bg-white p-3 rounded-xl border border-ink-900/10 mb-4 flex gap-2 flex-wrap">
        <input value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} placeholder="Room number, property..." className="flex-1 min-w-[180px] px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm" />
        <select value={filter.owner_id} onChange={(e) => setFilter({ ...filter, owner_id: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Owners</option>
          {owners?.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <select value={filter.property_id} onChange={(e) => setFilter({ ...filter, property_id: e.target.value })} className="px-4 py-2.5 rounded-lg border border-ink-900/15 text-sm">
          <option value="">All Properties</option>
          {properties?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-ink-900/10 text-center">
          <div className="text-5xl mb-3">🛏️</div>
          <p className="text-ink-900/70">No rooms found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((room: any) => {
            const totalBeds = room.beds?.length || 0;
            const occCount = room.beds?.filter((b: any) => b.status === 'occupied').length || 0;
            return (
              <Link key={room.id} href={`/admin/rooms/${room.id}`} className="bg-white rounded-2xl border border-ink-900/10 hover:border-coral-300 transition overflow-hidden block">
                <div className="p-4 border-b border-ink-900/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-xl">Room {room.room_number}</h3>
                    <span className="text-xs bg-cream px-2 py-0.5 rounded-full font-bold capitalize">{room.room_type}</span>
                  </div>
                  <div className="text-xs text-ink-900/50 mt-1">{room.property?.name || room.property_name}</div>
                  <div className="text-xs text-ink-900/50">Owner: {room.owner?.name || room.owner_name}</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-ink-900/70">Occupancy</span>
                    <span className="font-bold">{occCount}/{totalBeds}</span>
                  </div>
                  {totalBeds > 0 && (
                    <div className="grid grid-cols-4 gap-1.5 mt-3">
                      {room.beds.map((bed: any) => (
                        <div key={bed.id} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                          bed.status === 'occupied' ? 'bg-rose-100 text-rose-700' :
                          bed.status === 'vacant' ? 'bg-emerald-100 text-emerald-700' :
                          bed.status === 'reserved' ? 'bg-amber-100 text-amber-700' :
                          'bg-ink-100 text-ink-900/70'
                        }`}>{bed.bed_number}</div>
                      ))}
                    </div>
                  )}
                  {room.monthly_rent > 0 && (
                    <div className="mt-3 pt-3 border-t border-ink-900/10 text-xs">
                      <span className="text-ink-900/50">Rent: </span>
                      <span className="font-bold text-coral-600">{formatINR(room.monthly_rent)}/mo</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
