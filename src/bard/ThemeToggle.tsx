import { MoonStar, SunMedium } from 'lucide-react';
import { useBardTheme } from './theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useBardTheme();
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className="bard-theme-toggle"
      aria-label={label}
      title={label}
      data-theme-toggle={theme}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <SunMedium size={17} strokeWidth={1.65} aria-hidden="true" /> : <MoonStar size={17} strokeWidth={1.65} aria-hidden="true" />}
    </button>
  );
}
