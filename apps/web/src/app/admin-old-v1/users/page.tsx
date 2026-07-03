'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminUsers() {
  const [filter, setFilter] = useState({ q: '', role: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.q) params.q = filter.q;
      if (filter.role) params.role = filter.role;
      return (await api.get('/admin/users', { params })).data.data;
    },
  });

  return (
    <div>
      <h1 className="font-display font-black text-3xl text-ink-950 mb-1">Users</h1>
      <p className="text-ink-700 mb-6">{data?.length || 0} users registered</p>

      <div className="card mb-5 p-4">
        <div className="grid grid-cols-2 gap-3">
          <input value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} placeholder="Search by name/email/phone..." className="input" />
          <select value={filter.role} onChange={(e) => setFilter({ ...filter, role: e.target.value })} className="input">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="telecaller">Telecaller</option>
            <option value="field_executive">Field Executive</option>
            <option value="seo_manager">SEO Manager</option>
            <option value="guest">Guest</option>
          </select>
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
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-center">Role</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((u: any) => (
                  <tr key={u.id} className="border-t border-ink-100 hover:bg-cream">
                    <td className="px-4 py-3 font-bold">{u.name}</td>
                    <td className="px-4 py-3 text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-xs">{u.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge capitalize ${
                        u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                        u.role === 'owner' ? 'bg-emerald-100 text-emerald-700' :
                        u.role === 'telecaller' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'field_executive' ? 'bg-violet-100 text-violet-700' :
                        u.role === 'seo_manager' ? 'bg-amber-100 text-amber-700' :
                        'bg-ink-100 text-ink-700'
                      }`}>{u.role?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.is_active == 1 ? <span className="badge bg-emerald-100 text-emerald-700">Active</span> : <span className="badge bg-rose-100 text-rose-700">Inactive</span>}
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
