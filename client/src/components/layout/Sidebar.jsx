import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Sprout,
  ShieldAlert,
  TrendingUp,
  Landmark,
  BellRing,
  Settings,
  User,
  LogOut,
  Activity,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Workflow', path: '/workflow', icon: Activity },
    { name: 'My Farm', path: '/profile', icon: Sprout },
    { name: 'Assessments', path: '/assessment', icon: ShieldAlert },
    { name: 'Market Intelligence', path: '/market', icon: TrendingUp },
    { name: 'Government Schemes', path: '/schemes', icon: Landmark },
    { name: 'Alerts', path: '/alerts', icon: BellRing },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile-edit', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-card text-foreground">
      <div className="p-6">
        <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider mb-4">Navigations</h3>
        <nav className="flex flex-col gap-1.5 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/10'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border bg-muted/5">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border min-h-[calc(100vh-4.6rem)] sticky top-[4.6rem] bg-card hidden md:block flex-shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay background */}
          <div className="fixed inset-0 bg-black/45" onClick={onClose}></div>

          {/* Drawer content */}
          <div className="relative w-64 max-w-sm bg-card h-full flex flex-col z-10 shadow-2xl animate-slide-in">
            <div className="absolute top-4 right-4 z-20">
              <button onClick={onClose} className="p-1 rounded-md bg-muted text-muted-foreground">
                ✕
              </button>
            </div>
            <div className="pt-10 h-full flex flex-col">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
