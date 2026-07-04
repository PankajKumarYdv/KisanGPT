import React from 'react';

export default function SeverityBadge({ severity }) {
  const styles = {
    Critical: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
    High: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    Medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    Low: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[severity] || styles.Low}`}>
      {severity}
    </span>
  );
}
