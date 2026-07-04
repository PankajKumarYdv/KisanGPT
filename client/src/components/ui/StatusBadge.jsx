import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    Completed: 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20',
    Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    Failed: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}
