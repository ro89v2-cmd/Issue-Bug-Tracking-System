export default function PriorityBadge({ priority }: { priority: string }) {
  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'Critical':
        return 'bg-red-950/70 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.25)] animate-pulse';
      case 'High':
        return 'bg-orange-950/60 text-orange-400 border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.2)]';
      case 'Medium':
        return 'bg-yellow-950/60 text-yellow-400 border-yellow-500/40';
      case 'Low':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  const getPriorityCode = (p: string) => {
    switch (p) {
      case 'Critical': return 'CRIT-0';
      case 'High': return 'HIGH-1';
      case 'Medium': return 'MED-2';
      case 'Low': return 'LOW-3';
      default: return 'INFO';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider border ${getPriorityStyle(
        priority
      )}`}
    >
      <span className="mr-1 font-bold">[{getPriorityCode(priority)}]</span>
      {priority}
    </span>
  );
}
