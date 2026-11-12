import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { BardWordmark, GuillocheField, SpiralSigil } from './Brand';
import { ColorSection, FormSection, IdentitySection, TypographySection } from './sections/Foundations';
import { ComponentCatalog } from './sections/ComponentCatalog';
import { AccessibilitySection, CompositionSection, MotionSection, UsageSection } from './sections/Guidance';

const sections = [
  ['identity', 'Identity'],
  ['color', 'Color'],
  ['typography', 'Type'],
  ['form', 'Form'],
  ['motion', 'Motion'],
  ['components', 'Components'],
  ['composition', 'Composition'],
  ['usage', 'Usage'],
  ['accessibility', 'Access'],
];

export function BardShowcase() {
  const [activeSection, setActiveSection] = useState('identity');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const elements = sections.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-18% 0px -70% 0px', threshold: 0 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bard-showcase" data-design-system="bard">
        <a className="bard-skip-link" href="#bard-main">Skip to content</a>
        <header className="bard-site-header">
          <a className="bard-site-header__brand" href="#bard-top" aria-label="Bard design system, back to top"><BardWordmark small /><span>Design system</span></a>
          <nav className="bard-section-nav" aria-label="Showcase sections">
            {sections.map(([id, label]) => <a href={`#${id}`} key={id} className={activeSection === id ? 'is-active' : undefined} aria-current={activeSection === id ? 'location' : undefined}>{label}</a>)}
          </nav>
          <span className="bard-site-header__edition">Edition 01</span>
        </header>

        <main id="bard-main">
          <section className="bard-hero" id="bard-top" aria-labelledby="bard-title">
            <div className="bard-hero__copy">
              <div className="bard-hero__kicker"><span className="bard-eyebrow">A design language for considered expression</span><span>Vol. 01 / 2026</span></div>
              <h1 id="bard-title">Bard</h1>
              <p className="bard-hero__statement">The art of making<br />an interface <em>resonate.</em></p>
              <p className="bard-hero__intro">An expressive, exacting system of color, typography, motion, and interaction—composed for experiences that feel both lucid and alive.</p>
              <div className="bard-hero__actions"><a href="#components" className="bard-button bard-button--primary">Explore components <ArrowDown size={16} aria-hidden="true" /></a><a href="#identity" className="bard-text-link">Read the principles <ArrowUpRight size={15} aria-hidden="true" /></a></div>
              <div className="bard-hero__footnote"><span>19 components</span><i /><span>9 foundations &amp; guides</span><i /><span>WCAG 2.2 AA oriented</span></div>
            </div>
            <div className="bard-hero__art" aria-label="Bard identity: a dark spiral over pale mint, aqua, and lilac guilloché lines" role="img">
              <GuillocheField />
              <div className="bard-hero__art-top"><span>THE BARD STANDARD</span><span>EST. MMXXVI</span></div>
              <SpiralSigil className="bard-hero__sigil" animated />
              <span className="bard-hero__word" aria-hidden="true">Bard</span>
              <div className="bard-hero__art-bottom"><span>Expression, with exactitude.</span><span>№ 001</span></div>
            </div>
            <a className="bard-hero__scroll" href="#identity"><span>Follow the line</span><i aria-hidden="true" /></a>
          </section>

          <div className="bard-sections">
            <IdentitySection />
            <ColorSection />
            <TypographySection />
            <FormSection />
            <MotionSection />
            <ComponentCatalog />
            <CompositionSection />
            <UsageSection />
            <AccessibilitySection />
          </div>
        </main>

        <footer className="bard-footer">
          <div><BardWordmark /><p>Make the essential clear.<br />Make the meaningful memorable.</p></div>
          <div className="bard-footer__meta"><span>Bard design system</span><span>Edition 01 · 2026</span><a href="#bard-top">Return to the beginning <ArrowUpRight size={14} aria-hidden="true" /></a></div>
          <svg viewBox="0 0 800 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40 C90 0 150 80 240 40 S390 0 480 40 S630 80 800 40" /><path d="M0 45 C90 5 150 85 240 45 S390 5 480 45 S630 85 800 45" /><path d="M0 35 C90 -5 150 75 240 35 S390 -5 480 35 S630 75 800 35" /></svg>
        </footer>
      </div>
    </MotionConfig>
  );
}
