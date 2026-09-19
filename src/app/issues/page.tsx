'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import IssueCard from '@/components/IssueCard';

interface IssueData {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  assignee: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/issues');
      const data = await res.json();
      if (data.success) {
        setIssues(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('CONFIRM PURGE: ต้องการลบรายการ Incident นี้ออกจากฐานข้อมูลหรือไม่?')) return;

    try {
      const res = await fetch(`/api/issues/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setIssues(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error('Failed to purge issue:', err);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filterStatus && issue.status !== filterStatus) return false;
    if (filterPriority && issue.priority !== filterPriority) return false;
    if (filterType && issue.type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.reporter.toLowerCase().includes(query) ||
        issue.assignee.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-4xl animate-spin text-emerald-400">⚡</div>
        <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
          &gt; QUERYING INCIDENT LOGS...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-emerald-500 font-mono tracking-widest uppercase mb-1">
            // TELEMETRY REPOSITORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            ALL DETECTED INCIDENTS &amp; BUGS
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">
            {filteredIssues.length} RECORDS FOUND IN DATABASE
          </p>
        </div>
        <Link
          href="/issues/new"
          className="inline-flex items-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all font-mono"
        >
          ➕ LOG NEW INCIDENT
        </Link>
      </div>

      {/* Cyberpunk Filter Grid */}
      <div className="bg-slate-950/80 rounded-xl border border-emerald-500/30 p-4 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono">
          <div>
            <input
              type="text"
              placeholder="&gt; SEARCH TELEMETRY..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 placeholder-emerald-800 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 focus:outline-none focus:border-emerald-400"
            >
              <option value="">ALL OOP TYPES</option>
              <option value="Bug">🐛 Bug (Subclass)</option>
              <option value="Feature">✨ Feature (Subclass)</option>
              <option value="Task">📋 Task (Base)</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 focus:outline-none focus:border-emerald-400"
            >
              <option value="">ALL STATUSES</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 focus:outline-none focus:border-emerald-400"
            >
              <option value="">ALL SEVERITY</option>
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🟠 High</option>
              <option value="Critical">🔴 Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cyberpunk List Feed */}
      <div className="space-y-3">
        {filteredIssues.length > 0 ? (
          filteredIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onDelete={handleDelete} />
          ))
        ) : (
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-12 text-center text-slate-500 font-mono text-xs">
            <span className="text-3xl block mb-2 opacity-40">🛡️</span>
            NO INCIDENT TELEMETRY MATCHES QUERY PARAMETERS.
          </div>
        )}
      </div>
    </div>
  );
}
