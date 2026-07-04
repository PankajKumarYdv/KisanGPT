import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 border border-border bg-card rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center w-9 h-9 relative overflow-hidden"
      aria-label="Toggle Dark Mode"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={darkMode ? 'dark' : 'light'}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-500 flex-shrink-0" />
          ) : (
            <Moon className="w-5 h-5 text-blue-600 flex-shrink-0" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
