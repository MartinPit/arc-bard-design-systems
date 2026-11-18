import { useCallback, useEffect, useState } from 'react';

export type BardTheme = 'light' | 'dark';

export const BARD_THEME_STORAGE_KEY = 'bard-theme';
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function isBardTheme(value: unknown): value is BardTheme {
  return value === 'light' || value === 'dark';
}

export function readSavedBardTheme(): BardTheme | null {
  try {
    const saved = window.localStorage.getItem(BARD_THEME_STORAGE_KEY);
    return isBardTheme(saved) ? saved : null;
  } catch {
    return null;
  }
}

function getInitialBardTheme(): BardTheme {
  const saved = readSavedBardTheme();
  if (saved) return saved;

  const initialized = document.documentElement.dataset.theme;
  if (isBardTheme(initialized)) return initialized;

  try {
    return window.matchMedia?.(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function restoreTransitions(root: HTMLElement) {
  root.classList.remove('bard-theme-changing');
}

function applyDocumentTheme(theme: BardTheme, quiet = false) {
  const root = document.documentElement;
  if (quiet) root.classList.add('bard-theme-changing');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute('content', theme === 'dark' ? '#0d1420' : '#e9f2e9');

  if (!quiet) return;
  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => restoreTransitions(root)));
  } else {
    window.setTimeout(() => restoreTransitions(root), 0);
  }
}

export function useBardTheme() {
  const [theme, setTheme] = useState<BardTheme>(getInitialBardTheme);
  const [explicitTheme, setExplicitTheme] = useState<BardTheme | null>(readSavedBardTheme);

  useEffect(() => {
    applyDocumentTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (explicitTheme) return;

    let media: MediaQueryList | undefined;
    try {
      media = window.matchMedia?.(DARK_SCHEME_QUERY);
    } catch {
      return;
    }
    if (!media) return;

    const followSystem = (event: MediaQueryListEvent) => {
      const next = event.matches ? 'dark' : 'light';
      setTheme(next);
      applyDocumentTheme(next, true);
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', followSystem);
      return () => media.removeEventListener?.('change', followSystem);
    }

    media.addListener?.(followSystem);
    return () => media.removeListener?.(followSystem);
  }, [explicitTheme]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setExplicitTheme(next);
    setTheme(next);
    applyDocumentTheme(next, true);
    try {
      window.localStorage.setItem(BARD_THEME_STORAGE_KEY, next);
    } catch {
      // The explicit choice still applies for this session when storage is unavailable.
    }
  }, [theme]);

  return { theme, toggleTheme };
}
