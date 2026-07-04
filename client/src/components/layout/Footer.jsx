import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} KisanGPT. Empowering farmers with AI-driven agricultural intelligence.</p>
      </div>
    </footer>
  );
}
