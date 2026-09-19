'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePageLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authStage, setAuthStage] = useState<'idle' | 'scanning' | 'granted'>('idle');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'SYSTEM INITIALIZED :: SECURE PROTOCOL v4.0.9',
    'AWAITING OPERATOR CREDENTIALS...',
  ]);
  const [securityLevel, setSecurityLevel] = useState<'ALPHA' | 'RESTRICTED' | 'DEFCON-1'>('RESTRICTED');

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const isAuth = localStorage.getItem('cyber_auth');
    if (isAuth) {
      router.push('/dashboard');
    }

    const interval = setInterval(() => {
      const levels: ('ALPHA' | 'RESTRICTED' | 'DEFCON-1')[] = ['ALPHA', 'RESTRICTED', 'DEFCON-1'];
      setSecurityLevel(levels[Math.floor(Math.random() * levels.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !passcode) return;

    setAuthStage('scanning');
    setTerminalLogs(prev => [
      ...prev,
      `[>] INITIATING HANDSHAKE FOR ID: ${username.toUpperCase()}`,
      `[*] PARSING RSA-4096 BIT CERTIFICATE...`,
      `[*] CHECKING FIREWALL & BIOMETRIC SIGNATURE...`,
    ]);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        `[✓] HASH VERIFICATION SUCCESSFUL.`,
        `[✓] PRIVILEGE LEVEL ELEVATED TO SYSADMIN.`,
        `[✓] ACCESS GRANTED. REDIRECTING TO COMMAND CENTER...`,
      ]);
      setAuthStage('granted');
      localStorage.setItem('cyber_auth', JSON.stringify({ user: username, timestamp: Date.now() }));

      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    }, 1500);
  };

  const handleBypass = () => {
    localStorage.setItem('cyber_auth', JSON.stringify({ user: 'operator-bypass', timestamp: Date.now() }));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative">
      {/* Cyber Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, #059669 1px, transparent 1px),
            linear-gradient(to bottom, #059669 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px'
        }}
      />

      {/* Cyberpunk Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Terminal Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-950/90 border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-500/10 p-6 md:p-8 backdrop-blur-md">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              DEFENSE GATEWAY // {securityLevel}
            </span>
          </div>
          <div className="text-[10px] text-emerald-500/70 tracking-wider">
            ENC: AES-256-GCM
          </div>
        </div>

        {/* Security Title & Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-xl font-black tracking-widest text-white uppercase">
            CYBER TRACE TERMINAL
          </h1>
          <p className="text-xs text-emerald-400/80 mt-1">
            ISSUE &amp; BUG TRACKING // CLASSIFIED PORTAL
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-emerald-400 mb-1 flex items-center justify-between">
              <span>&gt; OPERATOR_IDENTIFIER</span>
              <span className="text-[10px] text-emerald-600">INPUT REQUIRED</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-emerald-600 text-sm font-bold">#</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={authStage !== 'idle'}
                placeholder="root / admin / agent-07"
                className="w-full bg-slate-900/90 border border-emerald-500/40 rounded-xl pl-8 pr-3 py-2.5 text-sm text-emerald-300 placeholder-emerald-800 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-emerald-400 mb-1 flex items-center justify-between">
              <span>&gt; SECURITY_KEY_PASSPHRASE</span>
              <span className="text-[10px] text-emerald-600">SHA-512</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-emerald-600 text-sm font-bold">🔒</span>
              <input
                type="password"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                required
                disabled={authStage !== 'idle'}
                placeholder="••••••••••••••••"
                className="w-full bg-slate-900/90 border border-emerald-500/40 rounded-xl pl-8 pr-3 py-2.5 text-sm text-emerald-300 placeholder-emerald-800 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authStage !== 'idle'}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {authStage === 'idle' && '[ INITIALIZE AUTHORIZATION ]'}
            {authStage === 'scanning' && '[ DECRYPTING CREDENTIALS... ]'}
            {authStage === 'granted' && '[ ACCESS GRANTED :: REDIRECTING ]'}
          </button>
        </form>

        {/* Live Cyber Terminal Log Box */}
        <div className="mt-5 bg-black/90 border border-emerald-900/80 rounded-xl p-3 text-[11px] space-y-1 font-mono text-emerald-500 max-h-28 overflow-y-auto">
          {terminalLogs.map((log, index) => (
            <div key={index} className="leading-tight flex items-start space-x-1.5">
              <span className="text-emerald-700 select-none">&gt;&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>

        {/* Quick Bypass Button */}
        <div className="mt-4 pt-4 border-t border-emerald-500/20 text-center">
          <button
            onClick={handleBypass}
            className="text-xs text-emerald-600 hover:text-emerald-400 transition-colors uppercase tracking-wider"
          >
            ⚡ QUICK PASS (BYPASS LOGIN TO DASHBOARD) →
          </button>
        </div>
      </div>
    </div>
  );
}
