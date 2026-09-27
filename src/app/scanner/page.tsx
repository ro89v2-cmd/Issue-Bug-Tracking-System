'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ScanFinding, WebScanSummary, CodeScanSummary } from '@/services/scanners/types';

export default function ThreatScannerPage() {
  const [activeTab, setActiveTab] = useState<'web' | 'code'>('web');

  // Web Scanner State
  const [targetUrl, setTargetUrl] = useState('http://localhost:3000');
  const [webScanning, setWebScanning] = useState(false);
  const [webResult, setWebResult] = useState<WebScanSummary | null>(null);

  // Code Scanner State
  const [sourceCode, setSourceCode] = useState(`// Example: Unsafe Application Logic
const apiKey = "AKIAIOSFODNN7EXAMPLE"; // Leaked AWS Credential
const query = "SELECT * FROM users WHERE username = '" + req.body.username + "'"; // SQL Injection
eval("var payload = " + req.body.data); // Arbitrary Code Execution
`);
  const [codeScanning, setCodeScanning] = useState(false);
  const [codeResult, setCodeResult] = useState<CodeScanSummary | null>(null);

  // Track logged incidents to prevent duplicate clicks
  const [loggedFindingIds, setLoggedFindingIds] = useState<Record<string, boolean>>({});

  // 1. Run Web Scan
  const handleWebScan = async (urlToScan?: string) => {
    const url = urlToScan || targetUrl;
    if (!url.trim()) {
      toast.error('กรุณาระบุ URL ที่ต้องการสแกน');
      return;
    }

    try {
      setWebScanning(true);
      const res = await fetch('/api/scanner/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.success) {
        setWebResult(data.data);
        toast.success(`สแกนเสร็จสิ้น! พบ ${data.data.totalFindings} จุดตรวจความปลอดภัย`);
      } else {
        toast.error(data.error || 'การสแกนล้มเหลว');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      toast.error(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setWebScanning(false);
    }
  };

  // 2. Run Code Scan
  const handleCodeScan = async () => {
    if (!sourceCode.trim()) {
      toast.error('กรุณาใส่โค้ดที่ต้องการตรวจสอบ');
      return;
    }

    try {
      setCodeScanning(true);
      const res = await fetch('/api/scanner/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sourceCode }),
      });
      const data = await res.json();

      if (data.success) {
        setCodeResult(data.data);
        toast.success(`ตรวจสอบโค้ดเสร็จสิ้น! พบ ${data.data.totalFindings} ช่องโหว่`);
      } else {
        toast.error(data.error || 'การตรวจสอบล้มเหลว');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Inspection failed';
      toast.error(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setCodeScanning(false);
    }
  };

  // 3. Auto-Log finding into DB as Threat or Bug
  const handleAutoLog = async (finding: ScanFinding) => {
    try {
      const toastId = toast.loading('กำลังบันทึก Incident เข้าสู่ Command Center...');
      const res = await fetch('/api/scanner/auto-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finding,
          reporter: 'SOC Automated Threat Engine',
        }),
      });
      const data = await res.json();

      if (data.success) {
        setLoggedFindingIds(prev => ({ ...prev, [finding.id]: true }));
        toast.success(
          <span>
            บันทึกสำเร็จ!{' '}
            <Link href={`/issues/${data.data.id}`} className="underline font-bold text-emerald-400">
              ดู Ticket #{data.data.id.slice(0, 8)}
            </Link>
          </span>,
          { id: toastId, duration: 5000 }
        );
      } else {
        toast.error(data.error || 'ไม่สามารถบันทึกได้', { id: toastId });
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการบันทึก Incident');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
      case 'High':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
      case 'Medium':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getGradeBadge = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'text-emerald-400 border-emerald-500 shadow-emerald-500/30';
    if (grade === 'B') return 'text-cyan-400 border-cyan-500 shadow-cyan-500/30';
    if (grade === 'C') return 'text-amber-400 border-amber-500 shadow-amber-500/30';
    return 'text-rose-500 border-rose-500 shadow-rose-500/40 animate-pulse';
  };

  return (
    <div className="space-y-8">
      {/* Top Threat Radar HUD Banner */}
      <div className="relative overflow-hidden bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl shadow-emerald-500/5 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold bg-emerald-950/70 border border-emerald-500/40 px-3 py-0.5 rounded-full">
                LIVE THREAT INTELLIGENCE &amp; BUG SCANNER ACTIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black mt-2 text-white tracking-wide uppercase">
              RADAR DETECTION CENTER
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-3xl font-mono leading-relaxed">
              ระบบตรวจสอบภัยคุกคามทางไซเบอร์และบั๊กของระบบแบบใช้งานได้จริง (Live Threat Scanner) ตรวจจับความปลอดภัยของเว็บ (Missing Headers, Sensitive Files Leak, CORS) และวิเคราะห์โค้ด (Secrets, Injection, Crash Bugs) พร้อมแปลงผลสแกนเป็น Incident ด้วยสถาปัตยกรรม OOP อัตโนมัติ
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-emerald-500/30 self-start md:self-center font-mono text-xs">
            <button
              onClick={() => setActiveTab('web')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'web'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <span>🌐</span>
              <span>WEB VULNERABILITY</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'code'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <span>🔍</span>
              <span>CODE &amp; SECRETS SAST</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: WEB VULNERABILITY SCANNER */}
      {activeTab === 'web' && (
        <div className="space-y-6">
          {/* Target URL Control Panel */}
          <div className="bg-slate-950/80 border border-emerald-500/25 rounded-2xl p-6 font-mono">
            <label className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
              🎯 TARGET URL / API ENDPOINT TO SCAN
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="https://example.com or http://localhost:3000"
                className="flex-1 px-4 py-3 bg-slate-900 border border-emerald-500/40 rounded-xl text-emerald-300 placeholder-emerald-900 text-sm focus:outline-none focus:border-emerald-400 font-mono shadow-inner"
              />
              <button
                onClick={() => handleWebScan()}
                disabled={webScanning}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {webScanning ? (
                  <>
                    <span className="animate-spin">⚡</span>
                    <span>RADAR SCANNING...</span>
                  </>
                ) : (
                  <>
                    <span>📡</span>
                    <span>INITIATE THREAT RADAR</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick-Pick Target Presets */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] text-slate-400">
              <span className="text-slate-500">QUICK TARGET PRESETS:</span>
              <button
                onClick={() => {
                  setTargetUrl('http://localhost:3000');
                  handleWebScan('http://localhost:3000');
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:border-emerald-500/40 transition-colors"
              >
                [ Localhost App :3000 ]
              </button>
              <button
                onClick={() => {
                  setTargetUrl('https://issue-bug-tracking-system-nine.vercel.app');
                  handleWebScan('https://issue-bug-tracking-system-nine.vercel.app');
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:border-cyan-500/40 transition-colors"
              >
                [ Cloud Vercel App ]
              </button>
              <button
                onClick={() => {
                  setTargetUrl('https://example.com');
                  handleWebScan('https://example.com');
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors"
              >
                [ Example.com ]
              </button>
            </div>
          </div>

          {/* Web Scan Summary Telemetry Card */}
          {webResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono">
                {/* Security Grade */}
                <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
                  <div className={`text-4xl font-black border-2 w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${getGradeBadge(webResult.securityGrade)}`}>
                    {webResult.securityGrade}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">SECURITY GRADE</div>
                  <div className="text-xs text-slate-500 font-bold">{webResult.score}/100 PTS</div>
                </div>

                {/* Response Latency */}
                <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-center">
                  <div className="text-2xl font-black text-emerald-400">{webResult.responseTimeMs} ms</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">LATENCY TIME</div>
                  <div className="text-xs text-emerald-500/80 mt-1">HTTP {webResult.statusCode} OK</div>
                </div>

                {/* Critical Threats */}
                <div className="bg-slate-950/80 border border-rose-500/30 rounded-2xl p-5 flex flex-col justify-center">
                  <div className="text-2xl font-black text-rose-400">{webResult.criticalCount}</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">CRITICAL CVE</div>
                  <div className="text-xs text-rose-500/80 mt-1">Immediate Threat</div>
                </div>

                {/* High Threats */}
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-center">
                  <div className="text-2xl font-black text-amber-400">{webResult.highCount}</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">HIGH RISK</div>
                  <div className="text-xs text-amber-500/80 mt-1">Action Required</div>
                </div>

                {/* Moderate/Low */}
                <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-5 flex flex-col justify-center">
                  <div className="text-2xl font-black text-slate-300">{webResult.mediumCount + webResult.lowCount}</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">MEDIUM / LOW</div>
                  <div className="text-xs text-slate-500 mt-1">Hardening Advice</div>
                </div>
              </div>

              {/* Detected Threat Findings */}
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
                    <span>🚨</span> REAL DETECTED THREATS &amp; SECURITY GAPS ({webResult.findings.length})
                  </h3>
                  <span className="text-slate-500 text-xs">
                    TARGET: {webResult.targetUrl}
                  </span>
                </div>

                {webResult.findings.length === 0 ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-8 text-center text-emerald-400 text-xs">
                    ✓ EXCELLENT: No security vulnerabilities or missing headers detected on this target!
                  </div>
                ) : (
                  webResult.findings.map(finding => {
                    const isLogged = loggedFindingIds[finding.id];
                    return (
                      <div
                        key={finding.id}
                        className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${getSeverityBadge(finding.severity)}`}>
                              {finding.severity} (CVSS: {finding.cvssScore.toFixed(1)})
                            </span>
                            <span className="text-slate-500 text-xs">[{finding.cveOrType}]</span>
                          </div>

                          {/* Auto-Log Button */}
                          <button
                            onClick={() => handleAutoLog(finding)}
                            disabled={isLogged}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 self-start sm:self-auto ${
                              isLogged
                                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                                : 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20 cursor-pointer'
                            }`}
                          >
                            <span>{isLogged ? '✓' : '⚡'}</span>
                            <span>{isLogged ? 'INCIDENT LOGGED IN REPO' : 'AUTO-LOG THREAT AS INCIDENT'}</span>
                          </button>
                        </div>

                        <div>
                          <h4 className="text-white font-bold text-sm tracking-wide">
                            {finding.title}
                          </h4>
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                            {finding.description}
                          </p>
                        </div>

                        {finding.evidence && (
                          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-300">
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">TARGET TELEMETRY / EVIDENCE:</span>
                            <code className="text-emerald-400">{finding.evidence}</code>
                          </div>
                        )}

                        <div className="bg-emerald-950/30 border border-emerald-500/20 p-2.5 rounded-lg text-[11px] text-emerald-300">
                          <span className="text-emerald-500 block text-[10px] uppercase tracking-wider mb-0.5">🛡️ RECOMMENDED MITIGATION / PATCH:</span>
                          {finding.remediation}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CODE VULNERABILITY & SECRETS INSPECTOR */}
      {activeTab === 'code' && (
        <div className="space-y-6">
          <div className="bg-slate-950/80 border border-emerald-500/25 rounded-2xl p-6 font-mono space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
                <span>📝</span> SOURCE CODE / STACK TRACE TO INSPECT
              </label>
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="text-slate-500">SAMPLE PAYLOADS:</span>
                <button
                  onClick={() =>
                    setSourceCode(`// Sample: Critical Secrets & Injection
const AWS_SECRET = "AKIAIOSFODNN7EXAMPLE";
const DB_PASS = "super_secret_db_password_123!";
function queryUser(userId) {
  const sql = "SELECT * FROM accounts WHERE id = " + userId;
  return db.query(sql);
}
eval("runCustomHandler('" + req.query.fn + "')");
`)
                  }
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400 hover:border-amber-500/50"
                >
                  [ Keys &amp; SQLi ]
                </button>
                <button
                  onClick={() =>
                    setSourceCode(`// Sample: XSS & Command Injection
import React from 'react';
import { exec } from 'child_process';

export function UserProfile({ rawInput, cmd }) {
  exec(\`ping -c 4 \${cmd}\`);
  return <div dangerouslySetInnerHTML={{ __html: rawInput }} />;
}
`)
                  }
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-purple-400 hover:border-purple-500/50"
                >
                  [ XSS &amp; Cmd Injection ]
                </button>
                <button
                  onClick={() =>
                    setSourceCode(`TypeError: Cannot read properties of undefined (reading 'sessionToken')
    at verifyAuthentication (C:/app/src/services/auth.ts:42:18)
    at handleRequest (C:/app/src/controllers/api.ts:89:12)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`)
                  }
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-rose-400 hover:border-rose-500/50"
                >
                  [ Stack Trace Bug ]
                </button>
              </div>
            </div>

            <textarea
              value={sourceCode}
              onChange={e => setSourceCode(e.target.value)}
              rows={9}
              placeholder="Paste JavaScript / TypeScript / SQL / Log trace here to scan..."
              className="w-full px-4 py-3 bg-slate-900 border border-emerald-500/30 rounded-xl text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400 shadow-inner"
            />

            <div className="flex justify-end">
              <button
                onClick={handleCodeScan}
                disabled={codeScanning}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center space-x-2 cursor-pointer"
              >
                {codeScanning ? (
                  <>
                    <span className="animate-spin">⚡</span>
                    <span>ANALYZING CODE AST...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>INSPECT CODE FOR DEFECTS &amp; SECRETS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Scan Results */}
          {codeResult && (
            <div className="space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
                  <span>🚨</span> CODE DEFECTS &amp; SECRET EXPOSURES DETECTED ({codeResult.totalFindings})
                </h3>
                <span className="text-slate-500 text-xs">
                  SCANNED {codeResult.linesScanned} LINES
                </span>
              </div>

              {codeResult.findings.length === 0 ? (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-8 text-center text-emerald-400 text-xs">
                  ✓ NO KNOWN VULNERABILITIES OR HARDCODED SECRETS FOUND IN PAYLOAD.
                </div>
              ) : (
                codeResult.findings.map(finding => {
                  const isLogged = loggedFindingIds[finding.id];
                  return (
                    <div
                      key={finding.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${getSeverityBadge(finding.severity)}`}>
                            {finding.severity} (CVSS: {finding.cvssScore.toFixed(1)})
                          </span>
                          <span className="text-slate-500 text-xs">[{finding.cveOrType}]</span>
                        </div>

                        {/* Auto-Log Button */}
                        <button
                          onClick={() => handleAutoLog(finding)}
                          disabled={isLogged}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 self-start sm:self-auto ${
                            isLogged
                              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                              : 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20 cursor-pointer'
                          }`}
                        >
                          <span>{isLogged ? '✓' : '⚡'}</span>
                          <span>{isLogged ? 'INCIDENT LOGGED IN REPO' : 'AUTO-LOG BUG/THREAT INCIDENT'}</span>
                        </button>
                      </div>

                      <div>
                        <h4 className="text-white font-bold text-sm tracking-wide">
                          {finding.title}
                        </h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                          {finding.description}
                        </p>
                      </div>

                      {finding.evidence && (
                        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-300">
                          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">EXCERPT IN CODE:</span>
                          <code className="text-amber-400 font-mono">{finding.evidence}</code>
                        </div>
                      )}

                      <div className="bg-emerald-950/30 border border-emerald-500/20 p-2.5 rounded-lg text-[11px] text-emerald-300">
                        <span className="text-emerald-500 block text-[10px] uppercase tracking-wider mb-0.5">🛡️ RECOMMENDED MITIGATION / PATCH:</span>
                        {finding.remediation}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
