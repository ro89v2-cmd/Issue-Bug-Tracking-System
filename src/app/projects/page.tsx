'use client';

import { useState, useEffect } from 'react';

interface ProjectData {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', owner: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (err) {
      console.error('Failed to query repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => [...prev, data.data]);
        setShowForm(false);
        setFormData({ name: '', description: '', owner: '' });
      }
    } catch (err) {
      console.error('Failed to register repository:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('CONFIRM PURGE: คุณต้องการลบโปรเจค/Repository นี้หรือไม่?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to purge repository:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-4xl animate-spin text-emerald-400">⚡</div>
        <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
          &gt; QUERYING ACTIVE REPOSITORIES...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] text-emerald-500 tracking-widest uppercase mb-1">
            // SECURE PROJECT REGISTRY
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            PROJECT REPOSITORIES
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {projects.length} PROJECTS ENROLLED UNDER SURVEILLANCE
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          {showForm ? '[ ABORT FORM ]' : '[ + NEW REPOSITORY ]'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-950/90 rounded-2xl border border-emerald-500/40 p-6 space-y-4 max-w-2xl backdrop-blur-md">
          <h3 className="text-sm font-bold text-emerald-400 border-b border-emerald-500/20 pb-2 uppercase tracking-wider">
            ENROLL NEW SYSTEM REPOSITORY
          </h3>
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1">&gt; REPOSITORY_NAME *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 placeholder-emerald-900 focus:outline-none focus:border-emerald-400 font-mono"
              placeholder="e.g. Zero-Trust Gateway Microservice"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1">&gt; MISSION_SCOPE_DESCRIPTION</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 placeholder-emerald-900 focus:outline-none focus:border-emerald-400 font-mono"
              placeholder="Brief overview of repository architecture..."
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1">&gt; LEAD_OPERATOR_OWNER</label>
            <input
              type="text"
              value={formData.owner}
              onChange={e => setFormData(prev => ({ ...prev, owner: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 placeholder-emerald-900 focus:outline-none focus:border-emerald-400 font-mono"
              placeholder="e.g. Lead Architect Somchai"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            [ COMMIT REPOSITORY ]
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <div key={project.id} className="bg-slate-950/80 rounded-xl border border-emerald-500/25 p-5 flex flex-col justify-between hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all backdrop-blur-sm">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-emerald-400">📁</span> {project.name}
                </h3>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-slate-600 hover:text-red-400 p-1 rounded transition-colors"
                  title="PURGE REPOSITORY"
                >
                  🗑️
                </button>
              </div>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">{project.description || 'NO DESCRIPTION SUPPLIED.'}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] text-slate-500 flex justify-between">
              <span>LEAD: {project.owner || 'UNSPECIFIED'}</span>
              <span>{new Date(project.createdAt).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
