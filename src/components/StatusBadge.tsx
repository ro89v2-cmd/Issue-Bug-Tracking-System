export default function StatusBadge({ status }: { status: string }) {
  const getBadgeStyle = (s: string) => {
    switch (s) {
      case 'Open':
        return 'bg-blue-950/60 text-blue-400 border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.15)]';
      case 'In Progress':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
      case 'Resolved':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
      case 'Closed':
        return 'bg-slate-900 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider border ${getBadgeStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {status}
    </span>
  );
}
