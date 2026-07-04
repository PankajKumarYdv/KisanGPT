import React from 'react';
import { useCurrentFarmer } from '../hooks/useFarmers.js';
import {
  useAlertsList,
  useMarkAlertRead,
  useMarkAllAlertsRead,
  useDeleteAlert,
} from '../hooks/useAlerts.js';
import { useToast } from '../components/ui/Toast.jsx';
import SeverityBadge from '../components/ui/SeverityBadge.jsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import {
  BellRing, CheckCircle2, Trash2, MailOpen, AlertTriangle, Bell,
  Calendar, ShieldAlert, RefreshCcw
} from 'lucide-react';

function AlertRow({ alert, onMarkRead, onDelete, markReadLoading, deleteLoading }) {
  const isUnread = !alert.isRead;

  return (
    <div
      className={`p-5 border rounded-3xl flex gap-4 items-start transition-all shadow-sm ${
        isUnread
          ? 'bg-gradient-to-tr from-card to-primary/[0.03] border-primary/20'
          : 'bg-card border-border opacity-75'
      }`}
    >
      <div
        className={`p-3 rounded-2xl flex-shrink-0 ${
          alert.severity === 'critical'
            ? 'bg-red-500/10 text-red-500'
            : alert.severity === 'high'
            ? 'bg-amber-500/10 text-amber-500'
            : alert.severity === 'medium'
            ? 'bg-yellow-500/10 text-yellow-600'
            : 'bg-blue-500/10 text-blue-500'
        }`}
      >
        <BellRing className={`w-5 h-5 ${isUnread ? 'animate-pulse' : ''}`} />
      </div>

      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-extrabold text-base leading-tight text-foreground">{alert.title}</h3>
          <SeverityBadge severity={alert.severity} />
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" title="Unread" />
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>

        <div className="flex flex-wrap justify-between items-center pt-2 border-t border-border/50 gap-2 text-[10px] font-semibold text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              Expires:{' '}
              {alert.expiresAt ? new Date(alert.expiresAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isUnread && (
              <button
                onClick={() => onMarkRead(alert._id)}
                disabled={markReadLoading}
                className="text-primary hover:underline font-bold disabled:opacity-50"
              >
                Mark Read
              </button>
            )}
            <button
              onClick={() => onDelete(alert._id)}
              disabled={deleteLoading}
              className="text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Alerts() {
  const { addToast } = useToast();
  const { data: farmer } = useCurrentFarmer();
  const farmerId = farmer?._id;

  const { data: response, isLoading, isError, refetch } = useAlertsList(
    farmerId ? { farmerId } : {}
  );
  const markReadMutation = useMarkAlertRead();
  const markAllMutation = useMarkAllAlertsRead();
  const deleteMutation = useDeleteAlert();

  const alerts = response?.data || [];
  const unreadAlerts = alerts.filter((a) => !a.isRead);

  const handleMarkRead = (id) => {
    markReadMutation.mutate(id, {
      onSuccess: () => addToast('Notification marked as read', 'success'),
      onError: () => addToast('Failed to mark as read', 'error'),
    });
  };

  const handleMarkAllRead = () => {
    const unreadIds = unreadAlerts.map((a) => a._id);
    markAllMutation.mutate(unreadIds, {
      onSuccess: () => addToast('All notifications marked as read', 'success'),
      onError: () => addToast('Failed to mark all as read', 'error'),
    });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => addToast('Notification cleared', 'success'),
      onError: () => addToast('Failed to clear notification', 'error'),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} type="card" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Bell className="w-8 h-8 text-primary" />
            System Alerts
          </h1>
          <p className="text-sm text-muted-foreground font-semibold">
            Real-time advisory details, crop pest warnings, and weather alerts.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="px-3 py-2 border border-border bg-card rounded-xl hover:bg-muted text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>

          {unreadAlerts.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAllMutation.isPending}
              className="px-4 py-2 border border-border bg-card rounded-xl hover:bg-muted text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <MailOpen className="w-4 h-4 text-primary" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 dark:text-red-400">Failed to load alerts</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              There was a problem fetching notifications from the server.
            </p>
          </div>
        </div>
      )}

      {/* Unread Count Badge */}
      {unreadAlerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
          <ShieldAlert className="w-4 h-4" />
          {unreadAlerts.length} unread notification{unreadAlerts.length > 1 ? 's' : ''} require
          your attention.
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <AlertRow
            key={alert._id}
            alert={alert}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
            markReadLoading={markReadMutation.isPending}
            deleteLoading={deleteMutation.isPending}
          />
        ))}

        {!isLoading && alerts.length === 0 && (
          <EmptyState
            title="All Clear!"
            description="No active agricultural, pest, or weather alerts detected for your farm region."
            icon={CheckCircle2}
          />
        )}
      </div>
    </div>
  );
}
