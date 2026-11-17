import { Moon, Sun } from 'lucide-react';
import type { ArcTheme } from '../theme';
import './ThemeToggle.css';

interface ThemeToggleProps {
  theme: ArcTheme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  const label = `Switch to ${nextTheme} mode`;
  return (
    <button type="button" className="arc-theme-toggle" aria-label={label} title={label} onClick={onToggle}>
      {theme === 'light' ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
      <span aria-hidden="true">{nextTheme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
