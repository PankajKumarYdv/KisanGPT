import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="max-w-md w-full mx-auto my-16 text-center space-y-6 text-foreground">
      <div className="inline-flex w-16 h-16 bg-red-500/10 text-red-600 rounded-full items-center justify-center border border-red-500/20">
        <ShieldX className="w-10 h-10" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">403 Unauthorized</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Access denied. You do not possess the required credentials or administrative role clearances to view this farm profile.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Link
          to="/dashboard"
          className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-opacity-95 shadow-md flex items-center gap-2 transition-all"
        >
          <Home className="w-4 h-4" /> Go to Dashboard
        </Link>
        <Link
          to="/login"
          className="px-5 py-2 border border-border text-sm font-semibold rounded-xl hover:bg-muted flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
}
