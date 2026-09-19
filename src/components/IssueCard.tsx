import Link from 'next/link';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface IssueCardProps {
  issue: {
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
  };
  onDelete?: (id: string) => void;
}

export default function IssueCard({ issue, onDelete }: IssueCardProps) {
  const getTypeTag = (type: string) => {
    switch (type) {
      case 'Bug':
        return { icon: '🐛', label: 'VULN/BUG', color: 'text-red-400 border-red-500/30 bg-red-950/40' };
      case 'Feature':
        return { icon: '✨', label: 'ENHANCE', color: 'text-purple-400 border-purple-500/30 bg-purple-950/40' };
      default:
        return { icon: '📋', label: 'TASK', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' };
    }
  };

  const tag = getTypeTag(issue.type);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-950/80 rounded-xl border border-emerald-500/25 p-5 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2.5 mb-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${tag.color}`}>
              {tag.icon} {tag.label}
            </span>
            <span className="text-slate-600 font-mono text-xs">#{issue.id.slice(0, 8)}</span>
          </div>

          <Link
            href={`/issues/${issue.id}`}
            className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors font-mono line-clamp-1"
          >
            &gt; {issue.title}
          </Link>

          <p className="text-slate-400 text-xs mt-2 mb-4 line-clamp-2 font-mono leading-relaxed">
            {issue.description || 'NO ADDITIONAL TELEMETRY LOGGED.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-900 font-mono">
            <div className="flex items-center space-x-4">
              <span>OP: {issue.reporter || 'ANONYMOUS'}</span>
              {issue.assignee && (
                <span className="text-emerald-400 font-medium">AGENT: {issue.assignee}</span>
              )}
            </div>
            <span className="text-slate-600">TIMESTAMP: {formatDate(issue.createdAt)}</span>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(issue.id)}
            className="ml-4 text-slate-600 hover:text-red-400 hover:bg-red-950/50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
            title="PURGE INCIDENT RECORD"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
