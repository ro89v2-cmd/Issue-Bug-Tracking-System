'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ScanFinding, WebScanSummary, CodeScanSummary } from '@/services/scanners/types';

export default function ThreatScannerPage() {
  const [activeTab, setActiveTab] = useState<'web' | 'code'>('web');
  const [isSimpleMode, setIsSimpleMode] = useState(true);

  // Web Scanner State
  const [targetUrl, setTargetUrl] = useState('http://localhost:3000');
  const [webScanning, setWebScanning] = useState(false);
  const [webResult, setWebResult] = useState<WebScanSummary | null>(null);

  // Code Scanner State
  const [sourceCode, setSourceCode] = useState(`// ตัวอย่างโค้ดที่มีความเสี่ยงหลายจุด:
const AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE"; // คีย์ลับ AWS หลุด
const OPENAI_KEY = "sk-proj-abc1234567890abcdef1234567890abcdef"; // คีย์ OpenAI หลุด

function loginUser(req, res) {
  // อันตราย: SQL Injection เอาข้อความมาบวกกันตรงๆ
  const sql = "SELECT * FROM users WHERE username = '" + req.body.username + "'";
  
  // อันตราย: eval สั่งรันโค้ดคอมพิวเตอร์ตามอำเภอใจ
  eval("console.log('User logged: ' + req.body.username)");
}
`);
  const [codeScanning, setCodeScanning] = useState(false);
  const [codeResult, setCodeResult] = useState<CodeScanSummary | null>(null);

  // Track logged incidents to prevent duplicate clicks
  const [loggedFindingIds, setLoggedFindingIds] = useState<Record<string, boolean>>({});

  // 1. Run Web Scan
  const handleWebScan = async (urlToScan?: string) => {
    const url = urlToScan || targetUrl;
    if (!url.trim()) {
      toast.error('กรุณาระบุ URL เว็บไซต์ที่ต้องการสแกน');
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
        toast.success(`สแกนเสร็จสมบูรณ์! ตรวจพบ ${data.data.totalFindings} จุดที่ควรระวัง`);
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
      toast.error('กรุณาวางโค้ดที่ต้องการตรวจสอบ');
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
        toast.success(`ตรวจสอบโค้ดเสร็จแล้ว! พบช่องโหว่/คีย์ลับ ${data.data.totalFindings} รายการ`);
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
      const toastId = toast.loading('กำลังนำบันทึกเข้า Command Center...');
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
              คลิกดู Ticket #{data.data.id.slice(0, 8)}
            </Link>
          </span>,
          { id: toastId, duration: 6000 }
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
        return 'bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.4)] font-black';
      case 'High':
        return 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)] font-black';
      case 'Medium':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50 font-bold';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getSeverityLabelThai = (severity: string) => {
    switch (severity) {
      case 'Critical': return '🔴 อันตรายสูงสุด (วิกฤต)';
      case 'High': return '🟠 ความเสี่ยงสูง (ควรแก้ด่วน)';
      case 'Medium': return '🟡 ความเสี่ยงปานกลาง';
      default: return '🟢 แนะนำเพื่อความปลอดภัย';
    }
  };

  const getGradeBadge = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'text-emerald-400 border-emerald-500 shadow-emerald-500/30';
    if (grade === 'B') return 'text-cyan-400 border-cyan-500 shadow-cyan-500/30';
    if (grade === 'C') return 'text-amber-400 border-amber-500 shadow-amber-500/30';
    return 'text-rose-500 border-rose-500 shadow-rose-500/40 animate-pulse';
  };

  // Helper Card Component for Finding
  const renderFindingCard = (finding: ScanFinding) => {
    const isLogged = loggedFindingIds[finding.id];
    return (
      <div
        key={finding.id}
        className="bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all space-y-4 shadow-xl backdrop-blur-md"
      >
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] px-3 py-1 rounded-lg border uppercase tracking-wider ${getSeverityBadge(finding.severity)}`}>
              {getSeverityLabelThai(finding.severity)}
            </span>
            <span className="text-slate-400 text-xs font-mono bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
              คะแนนความรุนแรง CVSS: {finding.cvssScore.toFixed(1)} / 10
            </span>
            <span className="text-slate-500 text-xs font-mono">
              [{finding.cveOrType}]
            </span>
          </div>

          {/* Auto-Log Incident Button */}
          <button
            onClick={() => handleAutoLog(finding)}
            disabled={isLogged}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 self-start sm:self-auto cursor-pointer ${
              isLogged
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 hover:scale-105'
            }`}
          >
            <span>{isLogged ? '✓' : '⚡'}</span>
            <span>{isLogged ? 'บันทึกเป็น Ticket แล้ว' : 'สร้าง Ticket สั่งแก้ไขทันที'}</span>
          </button>
        </div>

        {/* Title */}
        <div>
          <h4 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
            <span className="text-rose-400">⚠️</span>
            <span>{finding.title}</span>
          </h4>
        </div>

        {/* 💡 1. คำอธิบายแบบเข้าใจง่าย (Simple Explanation) */}
        <div className="bg-sky-950/30 border border-sky-500/30 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs">
            <span>💡</span>
            <span>อธิบายเข้าใจง่าย (คืออะไร?):</span>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed">
            {finding.simpleExplanation || finding.description}
          </p>
        </div>

        {/* ⚠️ 2. ผลกระทบหากไม่แก้ไข (Risk & Impact) */}
        {finding.riskImpact && (
          <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <span>🚨</span>
              <span>อันตรายอย่างไร หากไม่แก้ไข:</span>
            </div>
            <p className="text-amber-200/90 text-xs leading-relaxed">
              {finding.riskImpact}
            </p>
          </div>
        )}

        {/* 🛠️ 3. วิธีแก้ไขแบบเข้าใจง่าย (How to Fix Easy) */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
            <span>🛠️</span>
            <span>วิธีแก้ไขที่แนะนำ (ทำตามได้เลย):</span>
          </div>
          <p className="text-emerald-200/90 text-xs leading-relaxed whitespace-pre-line font-mono">
            {finding.howToFixEasy || finding.remediation}
          </p>
        </div>

        {/* ⚙️ 4. ข้อมูลเชิงลึกทางเทคนิค (เมื่อปิดโหมดง่าย หรือต้องการดูโค้ด/หลักฐาน) */}
        {(!isSimpleMode || finding.evidence) && (
          <div className="pt-2 border-t border-slate-900 text-xs space-y-2">
            {finding.evidence && (
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-300">
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">
                  🔍 จุดและหลักฐานที่ระบบตรวจพบ:
                </span>
                <code className="text-amber-400 break-all">{finding.evidence}</code>
              </div>
            )}
            {!isSimpleMode && (
              <div className="text-[11px] text-slate-500 font-mono">
                <span className="font-bold text-slate-400">Technical Details: </span>
                {finding.description}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Threat Radar HUD Banner */}
      <div className="relative overflow-hidden bg-slate-950/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/5 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full">
                COMMAND CENTER // THREAT DETECTION ENGINE 3.0
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-3 text-white tracking-wide uppercase">
              ศูนย์ตรวจจับช่องโหว่ &amp; บั๊กความปลอดภัย
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
              เครื่องมือสแกนหาช่องโหว่ของเว็บไซต์ และวิเคราะห์โค้ดเพื่อค้นหาคีย์ลับที่หลุดหรือบั๊กอันตรายจริง พร้อมคำอธิบายภาษาไทยแบบเข้าใจง่าย ไม่ต้องมีความรู้เชิงลึกก็อ่านเข้าใจและกดสั่งเปิด Ticket แก้ไขได้ทันที
            </p>
          </div>

          {/* Controls: Mode Switcher & Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Simple / Tech View Toggle */}
            <button
              onClick={() => setIsSimpleMode(!isSimpleMode)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                isSimpleMode
                  ? 'bg-sky-950/60 border-sky-500/50 text-sky-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="สลับโหมดคำอธิบาย"
            >
              <span>{isSimpleMode ? '💡 โหมดเข้าใจง่าย (เปิดอยู่)' : '⚙️ โหมดช่างเทคนิค'}</span>
            </button>

            {/* Tab Switcher */}
            <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-emerald-500/30 font-mono text-xs">
              <button
                onClick={() => setActiveTab('web')}
                className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'web'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <span>🌐</span>
                <span>สแกนเว็บไซต์/URL</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'code'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <span>🔍</span>
                <span>สแกนโค้ด &amp; รหัสผ่านหลุด</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: WEB VULNERABILITY SCANNER */}
      {activeTab === 'web' && (
        <div className="space-y-6">
          {/* Target URL Control Panel */}
          <div className="bg-slate-950/80 border border-emerald-500/25 rounded-2xl p-6 font-mono">
            <label className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
              🎯 ระบุ URL เว็บไซต์หรือ API ที่ต้องการให้เรดาร์ตรวจจับ
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="เช่น http://localhost:3000 หรือ https://yourwebsite.com"
                className="flex-1 px-4 py-3 bg-slate-900 border border-emerald-500/40 rounded-xl text-emerald-300 placeholder-emerald-900 text-sm focus:outline-none focus:border-emerald-400 shadow-inner"
              />
              <button
                onClick={() => handleWebScan()}
                disabled={webScanning}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {webScanning ? (
                  <>
                    <span className="animate-spin">⚡</span>
                    <span>กำลังส่งเรดาร์ตรวจสอบ...</span>
                  </>
                ) : (
                  <>
                    <span>📡</span>
                    <span>เริ่มสแกนหาช่องโหว่จริง</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick-Pick Target Presets */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] text-slate-400">
              <span className="text-slate-500">เลือกเว็บตัวอย่างด่วน:</span>
              <button
                onClick={() => {
                  setTargetUrl('http://localhost:3000');
                  handleWebScan('http://localhost:3000');
                }}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:border-emerald-500/40 transition-colors"
              >
                [ เว็บเครื่องนี้ (Localhost :3000) ]
              </button>
              <button
                onClick={() => {
                  setTargetUrl('https://issue-bug-tracking-system-nine.vercel.app');
                  handleWebScan('https://issue-bug-tracking-system-nine.vercel.app');
                }}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:border-cyan-500/40 transition-colors"
              >
                [ เว็บจริงบน Vercel ]
              </button>
              <button
                onClick={() => {
                  setTargetUrl('https://example.com');
                  handleWebScan('https://example.com');
                }}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors"
              >
                [ example.com ]
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
                  <div className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">เกรดความปลอดภัย</div>
                  <div className="text-xs text-slate-500 font-bold">{webResult.score}/100 คะแนน</div>
                </div>

                {/* Response Latency */}
                <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-center">
                  <div className="text-2xl font-black text-emerald-400">{webResult.responseTimeMs} ms</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">ความเร็วตอบสนอง</div>
                  <div className="text-xs text-emerald-500/80 mt-1">HTTP {webResult.statusCode} OK</div>
                </div>

                {/* Critical Threats */}
                <div className="bg-slate-950/80 border border-rose-500/30 rounded-2xl p-5 flex flex-col justify-center">
                  <div className="text-2xl font-black text-rose-400">{webResult.criticalCount}</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">จุดวิกฤตอันตราย</div>
                  <div className="text-xs text-rose-500/80 mt-1">เสี่ยงถูกเจาะทันที</div>
                </div>

                {/* High Threats */}
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-center">
                  <div className="text-2xl font-black text-amber-400">{webResult.highCount}</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">ความเสี่ยงสูง</div>
                  <div className="text-xs text-amber-500/80 mt-1">ต้องรีบแก้ไข</div>
                </div>

                {/* Moderate/Low */}
                <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-5 flex flex-col justify-center">
                  <div className="text-2xl font-black text-slate-300">{webResult.mediumCount + webResult.lowCount}</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">เสี่ยงปานกลาง/คำแนะนำ</div>
                  <div className="text-xs text-slate-500 mt-1">ควรปรับปรุงระบบ</div>
                </div>
              </div>

              {/* Detected Threat Findings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
                    <span>🚨</span> รายการช่องโหว่และความเสี่ยงที่ตรวจพบจริง ({webResult.findings.length} จุด)
                  </h3>
                  <span className="text-slate-500 text-xs font-mono">
                    เป้าหมาย: {webResult.targetUrl}
                  </span>
                </div>

                {webResult.findings.length === 0 ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-8 text-center text-emerald-400 text-sm">
                    ✓ ยอดเยี่ยมมาก! ไม่พบช่องโหว่หรือความเสี่ยงใดๆ บนเว็บไซต์เป้าหมายนี้
                  </div>
                ) : (
                  webResult.findings.map(finding => renderFindingCard(finding))
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
                <span>📝</span> วางซอร์สโค้ด หรือข้อความ Log Error เพื่อให้ระบบสแกนหาจุดบกพร่อง
              </label>

              {/* Sample Payloads */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">เลือกตัวอย่างทดสอบ:</span>
                <button
                  onClick={() =>
                    setSourceCode(`// ตัวอย่าง 1: คีย์ลับ AWS, OpenAI และ Database หลุด
const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";
const OPENAI_SECRET = "sk-proj-999988887777666655554444333322221111";
const STRIPE_KEY = "sk_test_mock_fake_payment_key_123456789";
const DATABASE_URL = "postgres://admin:SuperSecretPass123@db.example.com:5432/production";
`)
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 hover:border-amber-500/50 transition-colors"
                >
                  [ คีย์ลับหลุด ]
                </button>
                <button
                  onClick={() =>
                    setSourceCode(`// ตัวอย่าง 2: SQL Injection และ eval อันตราย
function searchAccount(userId, customExpression) {
  // บั๊ก: SQL Injection
  const query = "SELECT * FROM accounts WHERE id = " + userId;
  
  // บั๊ก: รันโค้ดอันตรายผ่าน eval
  eval("calculateBonus(" + customExpression + ")");
}
`)
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-rose-400 hover:border-rose-500/50 transition-colors"
                >
                  [ SQLi &amp; eval() ]
                </button>
                <button
                  onClick={() =>
                    setSourceCode(`// ตัวอย่าง 3: XSS ใน React และปิดระบบตรวจ SSL
import React from 'react';

export function CommentView({ userComment }) {
  // อันตราย: DOM XSS
  return <div dangerouslySetInnerHTML={{ __html: userComment }} />;
}

// อันตราย: ปิดการตรวจสอบใบรับรองความปลอดภัย
const axiosConfig = { rejectUnauthorized: false };
`)
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-purple-400 hover:border-purple-500/50 transition-colors"
                >
                  [ XSS &amp; SSL Bypass ]
                </button>
                <button
                  onClick={() =>
                    setSourceCode(`TypeError: Cannot read properties of undefined (reading 'sessionToken')
    at verifyAuthentication (C:/app/src/services/auth.ts:42:18)
    at handleRequest (C:/app/src/controllers/api.ts:89:12)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`)
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 hover:border-cyan-500/50 transition-colors"
                >
                  [ Log บั๊กขัดข้อง ]
                </button>
              </div>
            </div>

            <textarea
              value={sourceCode}
              onChange={e => setSourceCode(e.target.value)}
              rows={9}
              placeholder="วางโค้ด JavaScript / TypeScript / SQL หรือข้อความ Log Error ที่นี่..."
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
                    <span>กำลังวิเคราะห์โครงสร้างโค้ด...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>ตรวจหาบั๊ก &amp; ข้อมูลลับหลุดในโค้ด</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Scan Results */}
          {codeResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
                  <span>🚨</span> รายการช่องโหว่และข้อผิดพลาดในโค้ดที่ตรวจพบ ({codeResult.totalFindings} รายการ)
                </h3>
                <span className="text-slate-500 text-xs font-mono">
                  สแกนทั้งหมด {codeResult.linesScanned} บรรทัด
                </span>
              </div>

              {codeResult.findings.length === 0 ? (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-8 text-center text-emerald-400 text-sm">
                  ✓ โค้ดชุดนี้ปลอดภัย! ไม่พบคีย์ลับหลุดหรือรูปแบบคำสั่งที่เป็นอันตราย
                </div>
              ) : (
                codeResult.findings.map(finding => renderFindingCard(finding))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
