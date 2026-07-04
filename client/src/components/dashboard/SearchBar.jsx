import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ onSearch, placeholder = 'Search farmers, villages, districts...', initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  // Auto-debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [value, onSearch]);

  const handleClear = () => {
    setValue('');
  };

  return (
    <div className="relative w-full text-foreground">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 border border-border rounded-2xl bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold transition-all shadow-sm"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label="Clear Search Input"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
