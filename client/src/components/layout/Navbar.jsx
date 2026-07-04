import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import { LogOut, User as UserIcon, LayoutDashboard, Menu, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDrawer from './NotificationDrawer.jsx';
import { useCurrentFarmer } from '../../hooks/useFarmers.js';
import { useUnreadAlerts } from '../../hooks/useAlerts.js';
import { useDemoMode } from '../../hooks/useDemoMode.js';

export default function Navbar({ onMenuToggle }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { isDemo, toggleDemoMode, demoFarmerId, setDemoFarmer, farmers } = useDemoMode();

  // Fetch current farmer and unread alerts count
  const { data: farmer } = useCurrentFarmer();
  const farmerId = isDemo ? demoFarmerId : farmer?._id;
  const { data: unreadAlerts = [] } = useUnreadAlerts(isDemo ? null : farmerId);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-card border-b border-border px-6 py-3.5 flex justify-between items-center shadow-sm sticky top-0 z-40 text-foreground">
      <div className="flex items-center gap-3">
        {isAuthenticated && onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground md:hidden focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="text-2xl font-bold text-primary tracking-tight flex items-center gap-1.5">
          <span className="w-2.5 h-6 bg-gradient-to-t from-primary to-emerald-500 rounded-sm"></span>
          Kisan<span className="text-foreground">GPT</span>
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        {isAuthenticated ? (
          <>
            {/* Demo Mode Toggle */}
            <div className="flex items-center gap-2 bg-muted/40 border border-border px-3 py-1.5 rounded-xl shadow-inner text-xs">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground cursor-pointer flex items-center gap-1.5 select-none">
                <input 
                  type="checkbox" 
                  checked={isDemo} 
                  onChange={toggleDemoMode} 
                  className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                />
                Demo Mode
              </label>
              {isDemo && (
                <select 
                  value={demoFarmerId} 
                  onChange={(e) => setDemoFarmer(e.target.value)} 
                  className="bg-card border border-border rounded-lg text-xs font-bold px-2 py-0.5 outline-none text-foreground cursor-pointer focus:ring-1 focus:ring-primary"
                >
                  {farmers.map(f => (
                    <option key={f._id} value={f._id}>{f.fullName} ({f.cropType})</option>
                  ))}
                </select>
              )}
            </div>

            <Link
              to="/dashboard"
              className="text-sm font-semibold hover:text-primary transition-colors hidden sm:flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 border border-border bg-card rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground shadow-sm transition-all relative w-9 h-9 flex items-center justify-center"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-card">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >

                <img
                  src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'}
                  alt={user.fullName}
                  className="w-9 h-9 rounded-xl object-cover bg-primary/10 border border-primary/20 shadow-sm"
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-52 bg-card border border-border rounded-xl shadow-xl z-20 py-1 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-border bg-muted/10">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold truncate text-foreground">{user.fullName}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <>
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-semibold hover:text-primary transition-colors px-3 py-1.5 text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-1.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-opacity-95 shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </nav>
  );
}

