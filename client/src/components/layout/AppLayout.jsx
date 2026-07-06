import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function AppLayout() {
  const location = useLocation();
  const authPaths = ['/login', '/signup', '/registration', '/forgot-password', '/reset-password'];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
