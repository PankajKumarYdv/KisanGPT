import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Eye, Trash2, Bell, AlertCircle, AlertTriangle, CloudSun, TrendingUp, Cpu, Search } from 'lucide-react';
import { useUnreadAlerts, useMarkAlertRead, useMarkAllAlertsRead, useDeleteAlert } from '../../hooks/useAlerts.js';
import { useCurrentFarmer } from '../../hooks/useFarmers.js';
import { useDemoMode } from '../../hooks/useDemoMode.js';
import { Link, useNavigate } from 'react-router-dom';

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
      return AlertTriangle;
    case 'system':
      return Cpu;
    default:
      return Bell;
  }
};

const getSeverityStyles = (severity) => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-950 dark:text-red-400';
    case 'High':
      return 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-950 dark:text-amber-400';
    case 'Medium':
      return 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-950 dark:text-blue-400';
    default:
      return 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/30 dark:border-slate-900 dark:text-slate-400';
  }
};

export default function NotificationDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { isDemo, currentAlerts } = useDemoMode();
  const { data: farmer } = useCurrentFarmer();
  const farmerId = farmer?._id;

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Local storage persistence for read demo alert IDs
  const [demoReadIds, setDemoReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('kisangpt_demo_read_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const { data: realAlerts = [], isLoading: realLoading } = useUnreadAlerts(isDemo ? null : farmerId);
  const markReadMutation = useMarkAlertRead();
  const markAllReadMutation = useMarkAllAlertsRead();
  const deleteMutation = useDeleteAlert();

  const isLoading = isDemo ? false : realLoading;

  // Computed alert list
  const activeAlerts = isDemo 
    ? currentAlerts.filter(a => !demoReadIds.includes(a._id))
    : realAlerts;

  // Filter and Search logic
  const filteredAlerts = activeAlerts.filter(a => {
    const matchesSearch = 
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = 
      severityFilter === 'All' || 
      a.severity?.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  const handleMarkRead = (id) => {
    if (isDemo) {
      const newReadIds = [...demoReadIds, id];
      setDemoReadIds(newReadIds);
      localStorage.setItem('kisangpt_demo_read_alerts', JSON.stringify(newReadIds));
    } else {
      markReadMutation.mutate(id);
    }
  };

  const handleMarkAllRead = () => {
    const unreadIds = filteredAlerts.map((a) => a._id);
    if (unreadIds.length > 0) {
      if (isDemo) {
        const newReadIds = [...demoReadIds, ...unreadIds];
        setDemoReadIds(newReadIds);
        localStorage.setItem('kisangpt_demo_read_alerts', JSON.stringify(newReadIds));
      } else {
        markAllReadMutation.mutate(unreadIds);
      }
    }
  };

  const handleDelete = (id) => {
    if (isDemo) {
      handleMarkRead(id);
    } else {
      deleteMutation.mutate(id);
    }
  };

  const handleViewAlert = (id) => {
    handleMarkRead(id);
    onClose();
    navigate('/alerts');
  };

  // Reset filters when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSeverityFilter('All');
    }
  }, [isOpen]);

  const severityTabs = ['All', 'Critical', 'High', 'Medium', 'Low'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden text-foreground">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black animate-none"
          />

          {/* Sliding Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col h-full"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/10">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <h3 className="font-extrabold text-base">Alerts Center</h3>
                  {activeAlerts.length > 0 && (
                    <span className="ml-1.5 px-2 py-0.5 text-xs font-black bg-primary text-white rounded-full">
                      {activeAlerts.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {filteredAlerts.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-bold text-primary hover:underline focus:outline-none"
                    >
                      Mark filtered read
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all focus:outline-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs and Search Bar */}
              <div className="px-6 py-4 border-b border-border space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search alerts by keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary text-foreground font-medium"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                  {severityTabs.map((tab) => {
                    const count = activeAlerts.filter(a => tab === 'All' || a.severity?.toLowerCase() === tab.toLowerCase()).length;
                    return (
                      <button
                        key={tab}
                        onClick={() => setSeverityFilter(tab)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap focus:outline-none ${
                          severityFilter === tab
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/40 text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {tab} {count > 0 && `(${count})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alerts list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse border border-border p-4 rounded-2xl flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-2/3" />
                          <div className="h-3 bg-muted rounded w-5/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto text-primary">
                      <Check className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-sm">No alerts match criteria</h4>
                    <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                      Try resetting your search query or switching categories.
                    </p>
                  </div>
                ) : (
                  filteredAlerts.map((a) => {
                    const Icon = getAlertIcon(a.type);
                    const severityStyles = getSeverityStyles(a.severity);

                    return (
                      <div
                        key={a._id}
                        className={`p-4 border rounded-2xl flex gap-3 items-start hover:shadow-sm transition-all text-left bg-gradient-to-tr from-card to-muted/5 ${severityStyles}`}
                      >
                        <div className="p-2 rounded-xl bg-card border border-border flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-sm leading-tight text-foreground truncate">{a.title}</h4>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatTimeAgo(a.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {a.description}
                          </p>

                          <div className="flex justify-between items-center pt-2 border-t border-border/20 text-[10px] text-muted-foreground font-bold">
                            <span>Severity: <strong className="text-foreground">{a.severity}</strong></span>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleMarkRead(a._id)}
                                className="text-primary hover:underline flex items-center gap-0.5 focus:outline-none"
                              >
                                <Check className="w-3.5 h-3.5" /> Mark Read
                              </button>
                              <button
                                onClick={() => handleViewAlert(a._id)}
                                className="hover:text-foreground flex items-center gap-0.5 focus:outline-none"
                              >
                                <Eye className="w-3.5 h-3.5" /> Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* View All Alerts footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/10">
                <Link
                  to="/alerts"
                  onClick={onClose}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-opacity-95 shadow-md flex justify-center items-center gap-1.5 transition-all"
                >
                  <Bell className="w-4 h-4" /> View All Alerts
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
