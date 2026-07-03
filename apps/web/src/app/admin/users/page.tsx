'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function AdminUsers() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState({ search: '', role: '' });
  const [modalOpen, setModalOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.search) params.search = filter.search;
      if (filter.role) params.role = filter.role;
      return (await api.get('/admin/users', { params })).data.data;
    },
  });

  const toggle = async (id: number) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`);
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-black text-3xl">Users</h1>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-coral-500 text-white rounded-lg font-semibold">+ Create user</button>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          placeholder="Search name / email"
          className="px-3 py-2 rounded-lg border border-ink-900/15"
        />
        <select
          value={filter.role}
          onChange={(e) => setFilter({ ...filter, role: e.target.value })}
          className="px-3 py-2 rounded-lg border border-ink-900/15"
        >
          <option value="">All roles</option>
          {['admin', 'owner', 'telecaller', 'field_executive', 'guest', 'seo_manager'].map((r) => (
            <option key={r} value={r}>{r.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-ink-900/10 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900/5 text-left text-ink-900/60 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u: any) => (
                <tr key={u.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3 font-semibold">
                    {u.name}
                    <div className="text-xs text-ink-900/50">{u.phone}</div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="px-2 py-1 rounded-full text-xs bg-ink-900/5 capitalize">
                      {u.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {u.is_active == 1 ? (
                      <span className="text-emerald-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Disabled</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(u.id)} className="text-xs px-2 py-1 rounded border border-ink-900/15">
                      {u.is_active == 1 ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && <CreateUserModal onClose={() => setModalOpen(false)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setModalOpen(false); }} />}
    </div>
  );
}

function CreateUserModal({ onClose, onSuccess }: any) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'telecaller', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/users', form);
      toast.success('User created');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex justify-between items-start mb-6">
          <h2 className="font-display font-bold text-2xl">Create user</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-ink-900/15" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-ink-900/15" />
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full px-4 py-3 rounded-xl border border-ink-900/15" />
          <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-ink-900/15">
            <option value="telecaller">Tele-caller</option>
            <option value="field_executive">Field Executive</option>
            <option value="owner">Owner</option>
            <option value="seo_manager">SEO Manager</option>
            <option value="admin">Admin</option>
          </select>
          <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="w-full px-4 py-3 rounded-xl border border-ink-900/15" />
          <button type="submit" disabled={submitting} className="w-full py-3 bg-coral-500 text-white rounded-xl font-bold disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}
