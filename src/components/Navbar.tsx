'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // If on login/root, hide full navigation
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('cyber_auth');
    router.push('/');
  };

  const navLinks = [
    { href: '/dashboard', label: 'SOC Dashboard', icon: '📊' },
    { href: '/scanner', label: 'Threat Radar', icon: '📡' },
    { href: '/issues', label: 'Incidents & Bugs', icon: '🐛' },
    { href: '/issues/new', label: 'Log Incident', icon: '➕' },
    { href: '/projects', label: 'Repositories', icon: '📁' },
    { href: '/users', label: 'Agents & Users', icon: '👥' },
  ];

  return (
    <nav className="bg-slate-950 border-b border-emerald-500/30 text-emerald-400 font-mono shadow-lg shadow-emerald-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-lg">
                🛡️
              </span>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-widest text-white uppercase">
                  CYBER TRACE <span className="text-emerald-400">SOC</span>
                </span>
                <span className="text-[9px] text-emerald-600 tracking-wider">
                  OOP THREAT ENGINE
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs tracking-wider transition-all ${
                  pathname === link.href
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
                }`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1.5 text-xs text-red-400 bg-red-950/40 border border-red-500/30 rounded-lg hover:bg-red-900/40 transition-colors uppercase tracking-wider"
              title="Terminate Session"
            >
              🔒 LOCK TERMINAL
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-emerald-400 hover:text-white p-2 text-xl"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-emerald-500/20 px-4 pt-2 pb-4 space-y-2 bg-slate-950">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs tracking-wider ${
                pathname === link.href
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="mr-2">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            className="w-full text-left px-3 py-2 text-xs text-red-400 bg-red-950/40 border border-red-500/30 rounded-lg"
          >
            🔒 LOCK TERMINAL
          </button>
        </div>
      )}
    </nav>
  );
}
