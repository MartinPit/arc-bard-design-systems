import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { ArcLeaf, ArcStamp, RegistrationMark } from './components/Brand';
import { ColorSection, IdentitySection, MotionSection, ShapeSection, TypographySection } from './sections/Foundations';
import { ComponentsSection } from './sections/Components';
import { AccessibilitySection, CompositionSection, GuidanceSection } from './sections/Guidance';
import { ProtectedText } from './components/ProtectedText';
import { formatLedgerNumber, formatNumber, formatYear } from './intl';

const editionNumber = 1;
const editionYear = 2026;

const sections = [
  ['identity', 'Identity'], ['color', 'Color'], ['typography', 'Typography'], ['shape', 'Space & shape'],
  ['motion', 'Motion'], ['components', 'Components'], ['composition', 'Composition'], ['guidance', 'Guidance'], ['accessibility', 'Accessibility'],
];

export function ArcShowcase() {
  const [active, setActive] = useState('identity');

  useEffect(() => {
    if (!window.location.hash) return;
    try {
      document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
    } catch { /* Ignore malformed fragments rather than blocking the Showcase. */ }
  }, []);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.1, 0.5] },
    );
    sections.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="arc-root" data-design-system="arc">
      <a className="arc-skip-link" href="#arc-content">Skip to design system content</a>
      <header className="arc-hero">
        <div className="arc-hero__masthead">
          <span><ProtectedText>ARC</ProtectedText> / DESIGN SYSTEM</span>
          <span>EDITION {formatLedgerNumber(editionNumber)} · {formatYear(editionYear)}</span>
          <span>FORM, FUNCTION &amp; FEELING</span>
        </div>
        <div className="arc-hero__composition">
          <div className="arc-hero__copy">
            <p className="arc-eyebrow">AN EDITORIAL INTERFACE LANGUAGE</p>
            <h1 translate="no" className="notranslate" data-protected-text>Arc</h1>
            <p className="arc-hero__subtitle">Grounded in <em>clarity.</em><br />Curious by nature.</p>
            <p className="arc-hero__intro">A design system of warm paper, dark ink, and expressive botanical gestures—translated into precise, accessible interface foundations.</p>
            <div className="arc-hero__actions">
              <a className="arc-button arc-button--primary" href="#components"><span className="arc-button__content">Explore Components <ArrowDown size={16} aria-hidden="true" /></span></a>
              <a className="arc-text-link" href="#identity">Read the Principles <ArrowUpRight size={15} aria-hidden="true" /></a>
            </div>
          </div>
          <div className="arc-hero__art">
            <span className="arc-hero__plate">FIG. {formatLedgerNumber(0)} — THE ORIGIN LEAF</span>
            <ArcLeaf />
            <ArcStamp />
            <RegistrationMark className="arc-hero__registration arc-hero__registration--one" />
            <RegistrationMark className="arc-hero__registration arc-hero__registration--two" />
            <span className="arc-hero__side-note">ASYMMETRY / BALANCE / RHYTHM</span>
          </div>
        </div>
        <div className="arc-hero__colophon">
          <span><ProtectedText>FRAUNCES</ProtectedText> + <ProtectedText>INTER</ProtectedText> + <ProtectedText>IBM PLEX MONO</ProtectedText></span>
          <span>{formatNumber(19)} LIVE COMPONENT SPECIMENS</span>
          <span>AA-ORIENTED · REDUCED-MOTION READY</span>
        </div>
      </header>

      <nav className="arc-section-nav" aria-label="Design system sections">
        <div className="arc-section-nav__inner">
          <a className="arc-section-nav__brand notranslate" translate="no" href="#top" aria-label="Arc, back to top">A<span>rc</span></a>
          <div className="arc-section-nav__links">
            {sections.map(([id, label], index) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}><span>{formatLedgerNumber(index + 1)}</span>{label}</a>)}
          </div>
        </div>
      </nav>

      <main id="arc-content" tabIndex={-1}>
        <div id="top" className="arc-anchor-top" tabIndex={-1} />
        <IdentitySection />
        <ColorSection />
        <TypographySection />
        <ShapeSection />
        <MotionSection />
        <ComponentsSection />
        <CompositionSection />
        <GuidanceSection />
        <AccessibilitySection />
      </main>

      <footer className="arc-footer">
        <div className="arc-footer__leaf"><ArcLeaf /></div>
        <div><p className="arc-eyebrow">END MATTER / EDITION {formatLedgerNumber(editionNumber)}</p><p className="arc-footer__title">Make It Useful.<br /><em>Leave an Impression.</em></p></div>
        <div className="arc-footer__meta"><p><ProtectedText>Arc</ProtectedText> is a self-contained design-system showcase. All specimens operate locally; you keep personal data on this device.</p><a href="#top">Return to the Beginning <ArrowUpRight size={15} aria-hidden="true" /></a></div>
        <div className="arc-footer__bottom"><span><ProtectedText>ARC</ProtectedText> — DESIGN IN GOOD LIGHT</span><RegistrationMark /><span>PRINTED ON THE WEB / {formatYear(editionYear)}</span></div>
      </footer>
    </div>
  );
}
