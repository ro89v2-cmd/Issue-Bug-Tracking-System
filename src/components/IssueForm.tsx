'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface IssueFormProps {
  initialData?: Record<string, string>;
  isEditing?: boolean;
}

export default function IssueForm({ initialData, isEditing = false }: IssueFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'Bug',
    priority: initialData?.priority || 'Medium',
    assignee: initialData?.assignee || '',
    reporter: initialData?.reporter || '',
    projectId: initialData?.projectId || 'proj-1',
    status: initialData?.status || 'Open',
    stepsToReproduce: initialData?.stepsToReproduce || '',
    expectedBehavior: initialData?.expectedBehavior || '',
    actualBehavior: initialData?.actualBehavior || '',
    environment: initialData?.environment || '',
    useCase: initialData?.useCase || '',
    acceptanceCriteria: initialData?.acceptanceCriteria || '',
    estimatedEffort: initialData?.estimatedEffort || 'Medium',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = isEditing ? `/api/issues/${initialData?.id}` : '/api/issues';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/issues');
        router.refresh();
      } else {
        setError(data.error || 'OPERATION REJECTED BY SERVER');
      }
    } catch {
      setError('NETWORK DISRUPTION :: UNABLE TO CONNECT TO REPOSITORY');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 font-mono text-xs">
      {error && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-400 p-4 rounded-xl">
          [!] {error}
        </div>
      )}

      {/* Basic Telemetry */}
      <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-emerald-400 border-b border-emerald-500/20 pb-2 uppercase tracking-wider flex items-center gap-2">
          <span>📝</span> BASE INCIDENT TELEMETRY (OOP ENCAPSULATED FIELDS)
        </h3>

        <div>
          <label className="block uppercase tracking-wider text-slate-400 mb-1.5">&gt; INCIDENT_TITLE *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 placeholder-emerald-900 focus:outline-none focus:border-emerald-400"
            placeholder="e.g. Memory leak in auth token verification loop"
          />
        </div>

        <div>
          <label className="block uppercase tracking-wider text-slate-400 mb-1.5">&gt; TELEMETRY_PAYLOAD_DESCRIPTION</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 placeholder-emerald-900 focus:outline-none focus:border-emerald-400"
            placeholder="Comprehensive description of anomalous behavior or objective..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1.5">&gt; POLYMORPHIC_CLASS_TYPE *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 focus:outline-none focus:border-emerald-400"
            >
              <option value="Bug">🐛 Bug Class (Extends Issue + Attack/Bug Vector)</option>
              <option value="Feature">✨ Feature Class (Extends Issue + Specs)</option>
              <option value="Task">📋 Task Class (Base Issue Instance)</option>
            </select>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1.5">&gt; THREAT_SEVERITY_LEVEL *</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 focus:outline-none focus:border-emerald-400"
            >
              <option value="Low">🟢 Low (Minor defect)</option>
              <option value="Medium">🟡 Medium (Standard priority)</option>
              <option value="High">🟠 High (Elevated risk)</option>
              <option value="Critical">🔴 Critical (DEFCON-1 System Failure)</option>
            </select>
          </div>
        </div>

        {isEditing && (
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1.5">&gt; MITIGATION_STATUS</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 focus:outline-none focus:border-emerald-400"
            >
              <option value="Open">Open (Telemetry Logged)</option>
              <option value="In Progress">In Progress (Active Mitigation)</option>
              <option value="Resolved">Resolved (Patched / Verified)</option>
              <option value="Closed">Closed (Archived)</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1.5">&gt; REPORTING_OPERATOR</label>
            <input
              type="text"
              name="reporter"
              value={formData.reporter}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 placeholder-emerald-900 focus:outline-none focus:border-emerald-400"
              placeholder="e.g. Operator-Alpha"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1.5">&gt; ASSIGNED_AGENT</label>
            <input
              type="text"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 placeholder-emerald-900 focus:outline-none focus:border-emerald-400"
              placeholder="e.g. Agent-CyberDev"
            />
          </div>
        </div>
      </div>

      {/* Subclass Bug Specifics */}
      {formData.type === 'Bug' && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-red-400 border-b border-red-500/20 pb-2 uppercase tracking-wider flex items-center gap-2">
            <span>🐛</span> BUG REPRODUCTION MATRIX (SUBCLASS ATTRIBUTES)
          </h3>
          <div>
            <label className="block uppercase tracking-wider text-red-300/80 mb-1.5">&gt; STEPS_TO_REPRODUCE_VECTOR</label>
            <textarea
              name="stepsToReproduce"
              value={formData.stepsToReproduce}
              onChange={handleChange}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-red-500/30 rounded-xl text-red-300 placeholder-red-950 focus:outline-none focus:border-red-400"
              placeholder="1. Send crafted payload to /api/auth&#10;2. Observe unhandled exception&#10;3. Denial of service triggered"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-red-300/80 mb-1.5">&gt; EXPECTED_OUTPUT</label>
              <textarea
                name="expectedBehavior"
                value={formData.expectedBehavior}
                onChange={handleChange}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-red-500/30 rounded-xl text-red-300 placeholder-red-950 focus:outline-none focus:border-red-400"
                placeholder="Expected cryptographic validation failure with 401 status"
              />
            </div>
            <div>
              <label className="block uppercase tracking-wider text-red-300/80 mb-1.5">&gt; ACTUAL_ANOMALY</label>
              <textarea
                name="actualBehavior"
                value={formData.actualBehavior}
                onChange={handleChange}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-red-500/30 rounded-xl text-red-300 placeholder-red-950 focus:outline-none focus:border-red-400"
                placeholder="Crash / 500 internal server error with stack trace leak"
              />
            </div>
          </div>
          <div>
            <label className="block uppercase tracking-wider text-red-300/80 mb-1.5">&gt; TARGET_ENVIRONMENT</label>
            <input
              type="text"
              name="environment"
              value={formData.environment}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-red-500/30 rounded-xl text-red-300 placeholder-red-950 focus:outline-none focus:border-red-400"
              placeholder="e.g. Linux Kernel 6.5, Node 20, Kali/Chrome 122"
            />
          </div>
        </div>
      )}

      {/* Subclass Feature Specifics */}
      {formData.type === 'Feature' && (
        <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-purple-400 border-b border-purple-500/20 pb-2 uppercase tracking-wider flex items-center gap-2">
            <span>✨</span> FEATURE SPECIFICATION (SUBCLASS ATTRIBUTES)
          </h3>
          <div>
            <label className="block uppercase tracking-wider text-purple-300/80 mb-1.5">&gt; USER_MISSION_CASE</label>
            <textarea
              name="useCase"
              value={formData.useCase}
              onChange={handleChange}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-purple-300 placeholder-purple-950 focus:outline-none focus:border-purple-400"
              placeholder="As a SOC Analyst, I require 2FA authentication to secure admin privileges"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-purple-300/80 mb-1.5">&gt; ACCEPTANCE_CRITERIA_CHECKLIST</label>
            <textarea
              name="acceptanceCriteria"
              value={formData.acceptanceCriteria}
              onChange={handleChange}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-purple-300 placeholder-purple-950 focus:outline-none focus:border-purple-400"
              placeholder="- [ ] TOTP RFC 6238 compliant&#10;- [ ] Backup codes generated"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-purple-300/80 mb-1.5">&gt; ESTIMATED_ENGINEERING_EFFORT</label>
            <select
              name="estimatedEffort"
              value={formData.estimatedEffort}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-purple-300 focus:outline-none focus:border-purple-400"
            >
              <option value="Low">Low (1-2 Days)</option>
              <option value="Medium">Medium (3-5 Days)</option>
              <option value="High">High (1-2 Weeks)</option>
              <option value="Very High">Very High (&gt; 2 Weeks)</option>
            </select>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-slate-400 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors uppercase tracking-wider"
        >
          [ ABORT ]
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isSubmitting ? '[ COMMITTING TO REPO... ]' : isEditing ? '[ SAVE CHANGES ]' : '[ COMMIT INCIDENT ]'}
        </button>
      </div>
    </form>
  );
}
