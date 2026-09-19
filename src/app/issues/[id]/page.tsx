'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';

interface IssueDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  assignee: string;
  reporter: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  tags: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  environment?: string;
  useCase?: string;
  acceptanceCriteria?: string;
  estimatedEffort?: string;
}

export default function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<IssueDetail>>({});

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const res = await fetch(`/api/issues/${id}`);
      const data = await res.json();
      if (data.success) {
        setIssue(data.data);
        setEditData(data.data);
      }
    } catch (err) {
      console.error('Failed to query issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        fetchIssue();
      }
    } catch (err) {
      console.error('Failed to update issue:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('CONFIRM PURGE: ต้องการลบรายการ Incident นี้ออกจากฐานข้อมูลอย่างถาวรหรือไม่?')) return;
    try {
      const res = await fetch(`/api/issues/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/issues');
      }
    } catch (err) {
      console.error('Failed to purge issue:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchIssue();
      }
    } catch (err) {
      console.error('Failed to modify status:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-4xl animate-spin text-emerald-400">⚡</div>
        <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
          &gt; RETRIEVING INCIDENT RECORD #{id.slice(0, 8)}...
        </p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-20 bg-slate-950/80 rounded-2xl border border-slate-800 font-mono">
        <p className="text-slate-400 text-sm mb-4">[!] NO RECORD FOUND FOR ID SPECIFIED.</p>
        <Link href="/issues" className="text-emerald-400 hover:text-emerald-300 text-xs tracking-wider">
          ← RETURN TO INCIDENT REPOSITORY
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono text-xs">
      <div className="flex items-center justify-between">
        <Link href="/issues" className="text-slate-500 hover:text-emerald-400 text-xs font-bold tracking-wider">
          ← [ BACK TO TELEMETRY FEED ]
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 bg-amber-950/40 text-amber-400 border border-amber-500/40 rounded-lg hover:bg-amber-900/40 uppercase tracking-wider"
          >
            ✏️ {isEditing ? 'ABORT EDIT' : 'EDIT INCIDENT'}
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-red-950/40 text-red-400 border border-red-500/40 rounded-lg hover:bg-red-900/40 uppercase tracking-wider"
          >
            🗑️ PURGE RECORD
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-slate-950/80 rounded-2xl border border-emerald-500/30 p-6 space-y-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">HASH: {issue.id}</span>
          <span className="text-emerald-500/80 text-[11px]">PROJECT_REF: {issue.projectId}</span>
        </div>

        <div>
          {isEditing ? (
            <input
              type="text"
              value={editData.title || ''}
              onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="text-xl font-bold w-full px-3 py-2 bg-slate-900 border border-emerald-500/40 rounded-lg text-emerald-300 font-mono"
            />
          ) : (
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
              &gt; {issue.title}
            </h1>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
          <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            OOP SUBCLASS: {issue.type}
          </span>
        </div>

        {/* Quick state alteration switch */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-emerald-500/20">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">ALTER MITIGATION STATE:</span>
          {['Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-2.5 py-1 text-[11px] rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                issue.status === status
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900 text-slate-400 hover:text-emerald-300 border border-slate-800'
              }`}
            >
              [{status}]
            </button>
          ))}
        </div>
      </div>

      {/* Description Payload */}
      <div className="bg-slate-950/80 rounded-2xl border border-emerald-500/25 p-6 backdrop-blur-sm">
        <h3 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-3 flex items-center gap-2">
          <span>📝</span> INCIDENT PAYLOAD &amp; DESCRIPTION
        </h3>
        {isEditing ? (
          <textarea
            value={editData.description || ''}
            onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/40 rounded-lg text-emerald-300 font-mono"
          />
        ) : (
          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {issue.description || 'NO ADDITIONAL TELEMETRY LOGGED.'}
          </p>
        )}
      </div>

      {/* Bug Subclass Telemetry */}
      {issue.type === 'Bug' && (
        <div className="bg-red-950/20 rounded-2xl border border-red-500/30 p-6 space-y-4 backdrop-blur-sm">
          <h3 className="text-xs uppercase tracking-widest text-red-400 font-bold flex items-center gap-2">
            <span>🐛</span> SUBCLASS BUG ATTRIBUTES (INHERITED FROM ISSUE)
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-red-300/80 block uppercase tracking-wider mb-1">&gt; REPRODUCTION VECTOR:</span>
              <p className="text-red-200 bg-slate-950/90 p-3 rounded-lg border border-red-500/20 whitespace-pre-wrap">
                {issue.stepsToReproduce || 'N/A'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-red-300/80 block uppercase tracking-wider mb-1">&gt; EXPECTED RESULT:</span>
                <p className="text-red-200 bg-slate-950/90 p-3 rounded-lg border border-red-500/20">
                  {issue.expectedBehavior || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-red-300/80 block uppercase tracking-wider mb-1">&gt; ACTUAL BREACH/BEHAVIOR:</span>
                <p className="text-red-200 bg-slate-950/90 p-3 rounded-lg border border-red-500/20">
                  {issue.actualBehavior || 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <span className="text-red-300/80 block uppercase tracking-wider mb-1">&gt; COMPROMISED ENVIRONMENT:</span>
              <p className="text-red-200 bg-slate-950/90 p-3 rounded-lg border border-red-500/20">
                {issue.environment || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feature Subclass Telemetry */}
      {issue.type === 'Feature' && (
        <div className="bg-purple-950/20 rounded-2xl border border-purple-500/30 p-6 space-y-4 backdrop-blur-sm">
          <h3 className="text-xs uppercase tracking-widest text-purple-400 font-bold flex items-center gap-2">
            <span>✨</span> SUBCLASS FEATURE SPECIFICATIONS
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-purple-300/80 block uppercase tracking-wider mb-1">&gt; USE CASE OBJECTIVE:</span>
              <p className="text-purple-200 bg-slate-950/90 p-3 rounded-lg border border-purple-500/20">
                {issue.useCase || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-purple-300/80 block uppercase tracking-wider mb-1">&gt; ACCEPTANCE CRITERIA:</span>
              <p className="text-purple-200 bg-slate-950/90 p-3 rounded-lg border border-purple-500/20 whitespace-pre-wrap">
                {issue.acceptanceCriteria || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-purple-300/80 block uppercase tracking-wider mb-1">&gt; ESTIMATED DEV EFFORT:</span>
              <p className="text-purple-200 bg-slate-950/90 p-3 rounded-lg border border-purple-500/20 font-bold">
                {issue.estimatedEffort || 'Medium'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Metadata */}
      <div className="bg-slate-950/80 rounded-2xl border border-emerald-500/25 p-6 backdrop-blur-sm">
        <h3 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-3">
          ℹ️ METRIC &amp; AGENT ASSIGNMENT
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-slate-500 uppercase tracking-wider">REPORTER:</span>
            <span className="ml-2 text-white font-bold">{issue.reporter || 'ANONYMOUS'}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider">ASSIGNED AGENT:</span>
            {isEditing ? (
              <input
                type="text"
                value={editData.assignee || ''}
                onChange={e => setEditData(prev => ({ ...prev, assignee: e.target.value }))}
                className="ml-2 px-2 py-1 bg-slate-900 border border-emerald-500/40 rounded text-emerald-300 font-mono"
              />
            ) : (
              <span className="ml-2 text-emerald-400 font-bold">{issue.assignee || 'UNASSIGNED'}</span>
            )}
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider">INITIAL TELEMETRY:</span>
            <span className="ml-2 text-slate-400">{formatDate(issue.createdAt)}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider">LAST VERIFICATION:</span>
            <span className="ml-2 text-slate-400">{formatDate(issue.updatedAt)}</span>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20"
          >
            [ COMMIT REVISIONS ]
          </button>
        </div>
      )}
    </div>
  );
}
