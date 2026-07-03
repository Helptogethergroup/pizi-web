'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function OwnerComplaints() {
  const [filter, setFilter] = useState({ status: '', priority: '', category: '' });
  const [addModal, setAddModal] = useState(false);
  const qc = useQueryClient();

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['owner-complaints', filter],
    queryFn: async () => {
      const params: any = {};
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      if (filter.category) params.category = filter.category;
      return (await api.get('/owner/complaints', { params })).data.data;
    },
  });

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/owner/complaints/${id}/status`, { status });
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['owner-complaints'] });
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black text-3xl text-ink-950">Complaints</h1>
          <p className="text-ink-700 mt-1">{complaints?.length || 0} complaints</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary">+ Add Complaint</button>
      </div>

      {/* Filters */}
      <div className="card mb-5 p-4">
        <div className="grid grid-cols-3 gap-3">
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="input">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })} className="input">
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} className="input">
            <option value="">All Categories</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="wifi">WiFi</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="food">Food</option>
            <option value="furniture">Furniture</option>
            <option value="security">Security</option>
            <option value="ac">AC</option>
            <option value="water">Water</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : complaints?.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-5xl mb-3">🛠️</div>
          <p className="font-bold">No complaints</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints?.map((c: any) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge capitalize ${
                      c.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                      c.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                      'bg-ink-100 text-ink-700'
                    }`}>{c.priority}</span>
                    <span className="badge bg-coral-50 text-coral-700 capitalize">{c.category}</span>
                    <span className="text-xs text-ink-500 font-mono">#{c.ticket_number}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg">{c.title}</h3>
                  {c.description && <p className="text-sm text-ink-700 mt-1">{c.description}</p>}
                  <p className="text-xs text-ink-500 mt-2">
                    By <strong>{c.tenant_name}</strong> · {c.property_name} ·{' '}
                    {c.created_at && new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={c.status}
                    onChange={(e) => updateStatus(c.id, e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold border-0 ${
                      c.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                      c.status === 'open' ? 'bg-rose-100 text-rose-700' :
                      'bg-ink-100 text-ink-700'
                    }`}
                  >
                    <option value="open">Open</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addModal && <AddComplaintModal onClose={() => setAddModal(false)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['owner-complaints'] }); setAddModal(false); }} />}
    </div>
  );
}

function AddComplaintModal({ onClose, onSuccess }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ tenant_id: '', category: 'plumbing', priority: 'medium', title: '', description: '' });

  const { data: tenants } = useQuery({
    queryKey: ['owner-tenants'],
    queryFn: async () => (await api.get('/owner/tenants')).data.data,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/owner/complaints', form);
      toast.success('Complaint added');
      onSuccess();
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="font-display font-bold text-2xl mb-4">Add Complaint</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Tenant *</label>
            <select required value={form.tenant_id} onChange={(e) => setForm({ ...form, tenant_id: e.target.value })} className="input">
              <option value="">Select tenant</option>
              {tenants?.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.phone})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="wifi">WiFi</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="food">Food</option>
                <option value="furniture">Furniture</option>
                <option value="security">Security</option>
                <option value="ac">AC</option>
                <option value="water">Water</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
