import React from 'react';

export default function RiskBadge({ risk }) {
  const getRiskStyles = (val) => {
    if (val < 35) {
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20';
    } else if (val < 65) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    } else {
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getRiskStyles(risk)}`}>
      {risk}% Risk
    </span>
  );
}
