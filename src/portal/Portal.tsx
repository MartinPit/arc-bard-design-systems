import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const baseUrl = import.meta.env.BASE_URL;
type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem('portal-theme');
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function readSystemTheme(): Theme {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function usePortalTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => readStoredTheme() ?? 'system');
  const [systemTheme, setSystemTheme] = useState<Theme>(readSystemTheme);
  const theme = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'dark' : 'light');
    setSystemTheme(query.matches ? 'dark' : 'light');
    query.addEventListener('change', updateSystemTheme);
    return () => query.removeEventListener('change', updateSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#191815' : '#f2f0e9');
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setPreference(nextTheme);
    try {
      window.localStorage.setItem('portal-theme', nextTheme);
    } catch {
      // The selected theme still applies for this visit when storage is unavailable.
    }
  };

  return { theme, toggleTheme };
}

function ArcPreview() {
  return (
    <svg className="preview-art" viewBox="0 0 360 280" role="img" aria-label="Arc’s ivory, purple, and gradient-leaf visual language">
      <defs>
        <linearGradient id="portal-arc-gradient" x1="0.7" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#f3ad21" />
          <stop offset="0.46" stopColor="#e67e44" />
          <stop offset="1" stopColor="#b20a8b" />
        </linearGradient>
      </defs>
      <rect width="360" height="280" rx="3" fill="var(--portal-arc-stock)" />
      <path d="M34 216V144C34 59 101 24 218 24H311V92C311 189 246 237 137 237H34Z" fill="url(#portal-arc-gradient)" />
      <path d="M39 250H182" stroke="var(--portal-arc-ink)" strokeWidth="2" />
      <path d="M192 250H213M221 250H230" stroke="var(--portal-arc-ink)" strokeWidth="2" />
      <circle cx="306" cy="229" r="23" fill="none" stroke="var(--portal-arc-ink)" strokeWidth="1.5" />
      <circle cx="306" cy="229" r="17" fill="none" stroke="var(--portal-arc-ink)" strokeWidth="1" strokeDasharray="2 3" />
      <text x="306" y="234" textAnchor="middle" fill="var(--portal-arc-ink)" fontSize="15" fontFamily="monospace">01</text>
      <text x="39" y="267" fill="var(--portal-arc-ink)" fontSize="8" letterSpacing="2" fontFamily="monospace">GIFTED MAGICIAN</text>
    </svg>
  );
}

function BardPreview() {
  const waveLines = Array.from({ length: 9 }, (_, index) => (
    <path key={index} d={`M0 ${18 + index * 3} Q22 ${2 + index * 3} 44 ${18 + index * 3}T88 ${18 + index * 3}`} />
  ));

  return (
    <svg className="preview-art" viewBox="0 0 360 280" role="img" aria-label="Bard’s mint, lilac, and guilloché visual language">
      <defs>
        <linearGradient id="portal-bard-gradient" x1="0" y1="0.6" x2="1" y2="0.25">
          <stop offset="0" stopColor="var(--portal-bard-start)" />
          <stop offset="0.48" stopColor="var(--portal-bard-middle)" />
          <stop offset="1" stopColor="var(--portal-bard-end)" />
        </linearGradient>
        <pattern id="portal-bard-waves" width="88" height="48" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="var(--portal-bard-line)" strokeOpacity="0.34" strokeWidth="0.55">
            {waveLines}
          </g>
        </pattern>
      </defs>
      <rect width="360" height="280" rx="24" fill="url(#portal-bard-gradient)" />
      <rect width="360" height="280" rx="24" fill="url(#portal-bard-waves)" />
      <path d="M51 42C51 25 77 23 80 39C83 53 63 59 57 48C52 39 67 32 71 40C74 46 65 49 63 44" fill="none" stroke="var(--portal-bard-ink)" strokeWidth="4" strokeLinecap="round" />
      <text x="35" y="220" fill="var(--portal-bard-ink)" fontSize="50" fontFamily="Georgia, serif">Bard</text>
      <text x="38" y="245" fill="var(--portal-bard-muted)" fontSize="9" letterSpacing="1.5" fontFamily="monospace">MEMBER SINCE · 2026</text>
      <circle cx="312" cy="234" r="35" fill="var(--portal-bard-seal)" fillOpacity="0.3" stroke="var(--portal-bard-line)" strokeOpacity="0.4" />
      <path d="M288 236Q300 220 312 236T336 236" fill="none" stroke="var(--portal-bard-muted)" strokeOpacity="0.55" />
    </svg>
  );
}

export function Portal() {
  const { theme, toggleTheme } = usePortalTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <a className="wordmark" href={baseUrl} aria-label="Arc and Bard home">A<span>&</span>B</a>
        <p>Two independent design systems</p>
        <div className="portal-header__end">
          <span className="edition">Edition 001 / 2026</span>
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            <span>{nextTheme}</span>
          </button>
        </div>
      </header>

      <main>
        <section className="portal-intro" aria-labelledby="portal-title">
          <p className="eyebrow">From printed matter to living interfaces</p>
          <h1 id="portal-title">One origin.<br /><em>Two visual languages.</em></h1>
          <p className="intro-copy">Arc and Bard translate two membership cards into independent systems for the web. Shared interaction coverage. Separate points of view.</p>
        </section>

        <section className="system-index" aria-label="Choose a design system">
          <article className="system-entry arc-entry">
            <a href={`${baseUrl}arc/`} aria-label="Explore Arc design system">
              <div className="preview-frame"><ArcPreview /></div>
              <div className="entry-heading">
                <div><span className="entry-number">01</span><h2>Arc</h2></div>
                <ArrowUpRight aria-hidden="true" />
              </div>
              <p>Editorial warmth, printed precision, and a little everyday magic.</p>
              <ul aria-label="Arc characteristics"><li>Fraunces</li><li>Ivory + aubergine</li><li>Crisp motion</li></ul>
            </a>
            <a className="portal-app-link" href={`${baseUrl}arc/reading-room/`} aria-label="Open Arc Reading Room app prototype">
              <span>App prototype</span>
              <span>Reading Room<ArrowUpRight aria-hidden="true" /></span>
            </a>
          </article>

          <article className="system-entry bard-entry">
            <a href={`${baseUrl}bard/`} aria-label="Explore Bard design system">
              <div className="preview-frame"><BardPreview /></div>
              <div className="entry-heading">
                <div><span className="entry-number">02</span><h2>Bard</h2></div>
                <ArrowUpRight aria-hidden="true" />
              </div>
              <p>Guilloché intricacy, pearlescent calm, and ceremonial rhythm.</p>
              <ul aria-label="Bard characteristics"><li>Cormorant</li><li>Mint + lilac</li><li>Fluid motion</li></ul>
            </a>
          </article>
        </section>
      </main>

      <footer className="portal-footer">
        <p>19 components each. No shared visual language.</p>
        <p>React + TypeScript <span>·</span> Accessible by design</p>
      </footer>
    </div>
  );
}
