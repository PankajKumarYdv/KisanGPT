import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, WifiOff, RefreshCw } from 'lucide-react';

export default function NotFoundPage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4 text-foreground">
      {!isOnline ? (
        <>
          <div className="inline-flex w-16 h-16 bg-red-500/10 text-red-500 rounded-full items-center justify-center border border-red-500/20 mb-6">
            <WifiOff className="w-10 h-10 animate-bounce" />
          </div>
          <h1 className="text-4xl font-extrabold text-destructive tracking-tight mb-2">You are Offline</h1>
          <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
            KisanGPT dashboard requires an active internet connection to synchronize soil metrics. Please check your network and try again.
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 shadow-md flex items-center gap-2 transition-all focus:outline-none"
          >
            <RefreshCw className="w-4 h-4" /> Retry Connection
          </button>
        </>
      ) : (
        <>
          <div className="inline-flex w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full items-center justify-center border border-amber-500/20 mb-6">
            <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <h1 className="text-6xl font-extrabold text-amber-500 tracking-tighter mb-2">404</h1>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Page Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
            The agricultural workspace endpoint you requested does not exist or has been shifted.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-muted border border-border text-foreground font-bold rounded-xl hover:bg-muted/80 shadow flex items-center gap-2 transition-all focus:outline-none"
            >
              <RefreshCw className="w-4 h-4" /> Reload Page
            </button>
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 shadow-md flex items-center gap-2 transition-all"
            >
              <Home className="w-4 h-4" /> Go Back Home
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
