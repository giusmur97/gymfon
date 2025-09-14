"use client";

import { useTheme } from '@/providers/ThemeProvider';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border hover:bg-surface-2 transition-colors">
        <span className="w-5 h-5" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const current = theme === 'system' ? resolvedTheme : theme;

  const Icon = () => {
    if (current === 'dark') {
      // Moon icon (lucide-like) with professional look
      return (
        <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    }
    // Sun icon (lucide-like)
    return (
      <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  };

  const getLabel = () => {
    if (theme === 'system') {
      return `Sistema (${resolvedTheme === 'dark' ? 'Scuro' : 'Chiaro'})`;
    }
    return theme === 'dark' ? 'Modalità Scura' : 'Modalità Chiara';
  };

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50"
      title={`Cambia tema - Attuale: ${getLabel()}`}
      aria-label={`Cambia tema - Attuale: ${getLabel()}`}
    >
      <span className="transition-transform duration-300 will-change-transform">
        <Icon />
      </span>
    </button>
  );
}