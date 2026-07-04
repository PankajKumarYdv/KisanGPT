import React from 'react';
import AlertCard from './AlertCard.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { BellRing } from 'lucide-react';

export default function AlertList({ alerts = [], onMarkRead, onDelete }) {
  if (alerts.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title="No Active Alerts"
          description="Your coordinates are clear. There are no pending weather anomalies, pest outbreaks, or market price drops registered."
          icon={BellRing}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertCard
          key={alert._id}
          alert={alert}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
