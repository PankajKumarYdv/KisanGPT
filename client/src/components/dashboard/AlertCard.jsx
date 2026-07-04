import React from 'react';
import { BellRing, Trash2, CheckCircle2, CloudSun, TrendingUp, Cpu, Calendar } from 'lucide-react';
import SeverityBadge from '../ui/SeverityBadge.jsx';

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getAlertIcon = (type) => {
  switch (type) {
    case 'weather':
      return CloudSun;
    case 'market':
      return TrendingUp;
    case 'pest':
      return AlertTriangleIcon;
    case 'system':
      return Cpu;
    default:
      return BellRing;
  }
};

// Local AlertTriangle fallbacks
const AlertTriangleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const getSeverityColors = (severity) => {
  switch (severity) {
    case 'Critical':
      return 'border-l-red-500 shadow-red-500/5 bg-red-500/[0.02] border-red-200 dark:border-red-950/40';
    case 'High':
      return 'border-l-amber-500 shadow-amber-500/5 bg-amber-500/[0.02] border-amber-200 dark:border-amber-950/40';
    case 'Medium':
      return 'border-l-blue-500 shadow-blue-500/5 bg-blue-500/[0.02] border-blue-200 dark:border-blue-950/40';
    default:
      return 'border-l-slate-400 border-border bg-muted/[0.05]';
  }
};

export default function AlertCard({ alert, onMarkRead, onDelete }) {
  const Icon = getAlertIcon(alert.type);
  const severityColors = getSeverityColors(alert.severity);

  return (
    <div
      className={`p-5 border-y border-r border-l-4 rounded-2xl flex gap-4 items-start transition-all shadow-sm text-foreground bg-card ${severityColors} ${
        alert.isRead ? 'opacity-70 text-muted-foreground' : 'font-semibold'
      }`}
    >
      <div className={`p-3 rounded-2xl flex-shrink-0 ${
        alert.severity === 'Critical' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
        alert.severity === 'High' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
        alert.severity === 'Medium' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
        'bg-slate-500/10 text-slate-600 dark:text-slate-400'
      }`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
      </div>

      <div className="flex-1 space-y-2 min-w-0 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-extrabold text-base leading-tight truncate">{alert.title}</h3>
            {!alert.isRead && (
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" title="Unread Alert"></span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">
            {formatTimeAgo(alert.createdAt)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {alert.description}
        </p>

        <div className="pt-2.5 border-t border-border/40 flex justify-between items-center text-[10px] text-muted-foreground font-bold">
          <div className="flex items-center gap-1.5">
            <SeverityBadge severity={alert.severity} />
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Expires: {new Date(alert.expiresAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-4">
            {!alert.isRead && onMarkRead && (
              <button
                onClick={() => onMarkRead(alert._id)}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Read
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(alert._id)}
                className="text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
