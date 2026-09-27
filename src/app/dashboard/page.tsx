'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import IssueCard from '@/components/IssueCard';

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}

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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentIssues, setRecentIssues] = useState<IssueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, issuesRes] = await Promise.all([
        fetch('/api/issues/stats'),
        fetch('/api/issues'),
      ]);

      const statsData = await statsRes.json();
      const issuesData = await issuesRes.json();

      if (statsData.success) setStats(statsData.data);
      if (issuesData.success) {
        const sorted = issuesData.data.sort(
          (a: IssueData, b: IssueData) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentIssues(sorted.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-4xl animate-spin text-emerald-400">⚡</div>
        <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
          &gt; SCANNING THREAT INTELLIGENCE &amp; BUG REPOSITORY...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cybersecurity Top HUD Banner */}
      <div className="relative overflow-hidden bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl shadow-emerald-500/5 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                SECURITY OPERATION CENTER // OOP ENGINE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black mt-2 text-white tracking-wide uppercase">
              THREAT &amp; BUG COMMAND CENTER
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl font-mono leading-relaxed">
              สถาปัตยกรรม OOP ควบคุมช่องโหว่และติดตามงาน (Encapsulation, Inheritance, Polymorphism) ซิงก์ข้อมูลแบบ End-to-End บน Google Sheets API
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            <Link
              href="/scanner"
              className="inline-flex items-center px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-rose-600/30 transition-all hover:scale-105 border border-rose-400/40"
            >
              📡 LIVE THREAT RADAR
            </Link>
            <Link
              href="/issues/new"
              className="inline-flex items-center px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              ⚡ LOG NEW INCIDENT
            </Link>
          </div>
        </div>

        {/* 4 Pillars of OOP Badges in Cyberpunk Style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-500/20 text-xs font-mono">
          <div className="bg-slate-900/80 border border-emerald-500/20 p-3 rounded-xl">
            <span className="font-bold text-emerald-400 block mb-1">01. ENCAPSULATION</span>
            <span className="text-slate-400 text-[11px]">Private/Protected memory blocks + Getter/Setter validation</span>
          </div>
          <div className="bg-slate-900/80 border border-emerald-500/20 p-3 rounded-xl">
            <span className="font-bold text-emerald-400 block mb-1">02. INHERITANCE</span>
            <span className="text-slate-400 text-[11px]">Bug, Feature &amp; Threat models extend Core Base Issue</span>
          </div>
          <div className="bg-slate-900/80 border border-emerald-500/20 p-3 rounded-xl">
            <span className="font-bold text-emerald-400 block mb-1">03. POLYMORPHISM</span>
            <span className="text-slate-400 text-[11px]">Dynamic method dispatch (severity scoring, detail schema)</span>
          </div>
          <div className="bg-slate-900/80 border border-emerald-500/20 p-3 rounded-xl">
            <span className="font-bold text-emerald-400 block mb-1">04. SINGLETON &amp; FACTORY</span>
            <span className="text-slate-400 text-[11px]">IssueFactory router &amp; GoogleSheetService core</span>
          </div>
        </div>
      </div>

      {/* Cyber Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-3xl font-black text-emerald-400">{stats?.total || 0}</div>
          <div className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">TOTAL INCIDENTS</div>
          <div className="absolute right-3 top-3 text-2xl opacity-20">📊</div>
        </div>
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-3xl font-black text-amber-400">{stats?.byStatus?.['Open'] || 0}</div>
          <div className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">UNRESOLVED (OPEN)</div>
          <div className="absolute right-3 top-3 text-2xl opacity-20">⚠️</div>
        </div>
        <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-3xl font-black text-cyan-400">{stats?.byStatus?.['In Progress'] || 0}</div>
          <div className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">UNDER MITIGATION</div>
          <div className="absolute right-3 top-3 text-2xl opacity-20">⚙️</div>
        </div>
        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-3xl font-black text-emerald-300">{stats?.byStatus?.['Resolved'] || 0}</div>
          <div className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">PATCHED (RESOLVED)</div>
          <div className="absolute right-3 top-3 text-2xl opacity-20">🛡️</div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950/80 border border-emerald-500/25 rounded-2xl p-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold mb-4 flex items-center gap-2">
            <span>📌</span> CLASSIFICATION BY OBJECT TYPE
          </h3>
          <div className="space-y-3">
            {Object.entries(stats?.byType || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-mono text-xs">
                  {type === 'Threat' ? '🚨 Threat (Vulnerability & CVE)' : type === 'Bug' ? '🐛 Bug (Defect Instance)' : type === 'Feature' ? '✨ Feature (Enhancement)' : '📋 Task (Core Unit)'}
                </span>
                <span className="font-bold font-mono text-emerald-400 bg-slate-950 px-3 py-1 rounded-md border border-emerald-500/30 text-xs">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/80 border border-emerald-500/25 rounded-2xl p-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold mb-4 flex items-center gap-2">
            <span>🎯</span> INCIDENT SEVERITY SPECTRUM
          </h3>
          <div className="space-y-3">
            {Object.entries(stats?.byPriority || {}).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-mono text-xs">
                  {priority === 'Critical' ? '🔴 DEFCON-1 (Critical)' : priority === 'High' ? '🟠 HIGH THREAT' : priority === 'Medium' ? '🟡 MODERATE' : '🟢 MINOR'}
                </span>
                <span className="font-bold font-mono text-emerald-400 bg-slate-950 px-3 py-1 rounded-md border border-emerald-500/30 text-xs">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Incidents Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-widest font-bold text-emerald-400 flex items-center gap-2">
            <span>🕒</span> RECENT DETECTED INCIDENTS
          </h2>
          <Link href="/issues" className="text-emerald-500 hover:text-emerald-300 font-mono text-xs tracking-wider">
            VIEW ALL TELEMETRY ({stats?.total || 0}) →
          </Link>
        </div>

        <div className="space-y-3">
          {recentIssues.length > 0 ? (
            recentIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          ) : (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-10 text-center font-mono text-xs text-slate-500">
              NO INCIDENTS LOGGED IN REPOSITORY
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
