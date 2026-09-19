import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Cyber Trace SOC // Issue Bug Tracking System (OOP)',
  description: 'Cybersecurity Threat & Bug Tracking Center built with Next.js, OOP Architecture, and Google Sheets integration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-mono selection:bg-emerald-500 selection:text-black">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          {children}
        </main>
        <footer className="bg-slate-950 border-t border-emerald-500/20 py-6 text-center text-xs text-slate-500 font-mono tracking-wider">
          CYBER TRACE // SECURE INCIDENT MANAGEMENT PROTOCOL • OOP PARADIGM ARCHITECTURE
        </footer>
      </body>
    </html>
  );
}
