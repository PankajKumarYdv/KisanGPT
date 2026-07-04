import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import { ChevronRight, Home } from 'lucide-react';

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Create simple breadcrumb labels from path
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbMap = {
    dashboard: 'Dashboard',
    assessment: 'Assessments',
    profile: 'My Farm',
    market: 'Market Intelligence',
    schemes: 'Government Schemes',
    alerts: 'Alerts',
    settings: 'Settings',
    'profile-edit': 'Profile',
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumbs Header */}
          <div className="px-6 py-3 border-b border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Link to="/dashboard" className="hover:text-foreground flex items-center gap-1 transition-colors">
                <Home className="w-3.5 h-3.5" />
                Home
              </Link>
              {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const label = breadcrumbMap[name] || name;

                return (
                  <React.Fragment key={routeTo}>
                    <ChevronRight className="w-3.5 h-3.5" />
                    {isLast ? (
                      <span className="text-foreground font-bold">{label}</span>
                    ) : (
                      <Link to={routeTo} className="hover:text-foreground transition-colors">
                        {label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            <div className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-full">
              Region: Punjab APMC
            </div>
          </div>

          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
