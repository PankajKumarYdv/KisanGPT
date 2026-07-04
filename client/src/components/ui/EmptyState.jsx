import React from 'react';
import { Sprout } from 'lucide-react';
import Button from './Button.jsx';

export default function EmptyState({
  title = 'No Farmers Registered',
  description = 'Get started by creating a new farmer profile in the system database.',
  icon: Icon = Sprout,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border border-dashed rounded-3xl max-w-xl mx-auto shadow-sm text-foreground">
      <div className="relative mb-6">
        <svg 
          className="absolute -inset-4 w-18 h-18 text-primary/15" 
          viewBox="0 0 100 100"
          style={{ animation: 'spin 16s linear infinite' }}
        >
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" fill="none" />
        </svg>
        <div className="relative inline-flex p-4 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse">
          <Icon className="w-10 h-10" />
        </div>
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground font-semibold max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" className="font-bold flex items-center gap-2 focus:outline-none">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
