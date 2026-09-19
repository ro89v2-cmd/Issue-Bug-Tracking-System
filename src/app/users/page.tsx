'use client';

import { useState, useEffect } from 'react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Developer' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error('Failed to fetch personnel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => [...prev, data.data]);
        setShowForm(false);
        setFormData({ name: '', email: '', role: 'Developer' });
      }
    } catch (err) {
      console.error('Failed to enroll operator:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`CONFIRM PERSONNEL REVOCATION: ลบสิทธิ์และข้อมูลผู้ใช้ "${name}" ออกจากระบบถาวร?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        alert(data.error || 'REVOCATION FAILED');
      }
    } catch (err) {
      console.error('Revocation error:', err);
      alert('COMMUNICATION FAILURE WITH PERSONNEL DB');
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-950/60 text-purple-400 border-purple-500/40';
      case 'Manager': return 'bg-blue-950/60 text-blue-400 border-blue-500/40';
      case 'Developer': return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
      case 'Tester': return 'bg-amber-950/60 text-amber-400 border-amber-500/40';
      default: return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-4xl animate-spin text-emerald-400">⚡</div>
        <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
          &gt; QUERYING ACTIVE AGENTS &amp; OPERATORS...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] text-emerald-500 tracking-widest uppercase mb-1">
            // PERSONNEL &amp; ACCESS CONTROL (OOP USER CLASS)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            ENROLLED AGENTS &amp; USERS
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {users.length} OPERATORS REGISTERED IN ACCESS CONTROL LIST
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          {showForm ? '[ ABORT FORM ]' : '[ + ENROLL OPERATOR ]'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-950/90 rounded-2xl border border-emerald-500/40 p-6 space-y-4 max-w-2xl backdrop-blur-md">
          <h3 className="text-sm font-bold text-emerald-400 border-b border-emerald-500/20 pb-2 uppercase tracking-wider">
            CREATE OPERATOR IDENTITY (OOP ENCAPSULATION)
          </h3>
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1">&gt; OPERATOR_NAME *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 placeholder-emerald-900 focus:outline-none focus:border-emerald-400 font-mono"
              placeholder="e.g. Agent Phoenix / Somchai Dev"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1">&gt; ENCRYPTED_CONTACT_EMAIL *</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 placeholder-emerald-900 focus:outline-none focus:border-emerald-400 font-mono"
              placeholder="agent@cyberdefense.org"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1">&gt; PRIVILEGE_ROLE</label>
            <select
              value={formData.role}
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
            >
              <option value="Developer">Developer (Engineering Unit)</option>
              <option value="Tester">Tester (Quality &amp; Pentest)</option>
              <option value="Manager">Manager (Operations Lead)</option>
              <option value="Admin">Admin (SysAdmin / Root Level)</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            [ COMMIT IDENTITY ]
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-slate-950/80 rounded-xl border border-emerald-500/25 p-5 flex items-center justify-between hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all backdrop-blur-sm">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 bg-emerald-950/70 border border-emerald-500/40 rounded-xl flex items-center justify-center text-emerald-400 font-black text-lg shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-white tracking-wide text-sm">{user.name}</h3>
                <p className="text-slate-500 text-[11px] font-mono">{user.email}</p>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getRoleStyle(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Revoke Operator Button */}
            <button
              onClick={() => handleDelete(user.id, user.name)}
              disabled={deletingId === user.id}
              className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors border border-transparent hover:border-red-500/30 cursor-pointer"
              title="REVOKE OPERATOR ACCESS"
            >
              {deletingId === user.id ? (
                <span className="text-xs animate-spin">⏳</span>
              ) : (
                <span className="text-base">🗑️</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
