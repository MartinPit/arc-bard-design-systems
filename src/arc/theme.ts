import { useCallback, useEffect, useState } from 'react';

export type ArcTheme = 'light' | 'dark';

export const ARC_THEME_STORAGE_KEY = 'arc-theme';

function isArcTheme(value: string | null): value is ArcTheme {
  return value === 'light' || value === 'dark';
}

function readStoredTheme(): ArcTheme | null {
  try {
    const value = window.localStorage.getItem(ARC_THEME_STORAGE_KEY);
    return isArcTheme(value) ? value : null;
  } catch {
    return null;
  }
}

function readSystemTheme(): ArcTheme {
  try {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function useArcTheme() {
  const [preference, setPreference] = useState<ArcTheme | null>(readStoredTheme);
  const [systemTheme, setSystemTheme] = useState<ArcTheme>(readSystemTheme);
  const theme = preference ?? systemTheme;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#171019' : '#f4efe4');

    if (!root.classList.contains('arc-theme-changing')) return;
    const restoreTransitions = () => root.classList.remove('arc-theme-changing');
    if (typeof window.requestAnimationFrame !== 'function') {
      restoreTransitions();
      return;
    }
    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(restoreTransitions);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      restoreTransitions();
    };
  }, [theme]);

  useEffect(() => {
    if (preference || typeof window.matchMedia !== 'function') return;
    let query: MediaQueryList;
    try {
      query = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return;
    }
    const update = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'dark' : 'light');
    setSystemTheme(query.matches ? 'dark' : 'light');
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', update);
      return () => query.removeEventListener('change', update);
    }
    if (typeof query.addListener === 'function') {
      query.addListener(update);
      return () => query.removeListener(update);
    }
  }, [preference]);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.add('arc-theme-changing');
    setPreference(nextTheme);
    try {
      window.localStorage.setItem(ARC_THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The explicit in-memory choice still works when storage is unavailable.
    }
  }, [theme]);

  return { theme, toggleTheme };
}
