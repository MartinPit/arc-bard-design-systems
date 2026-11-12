import { CircleGauge, Feather, ScanLine } from 'lucide-react';
import { GuillocheField, SpiralSigil } from '../Brand';
import { CopyButton, Reveal, SectionHeader } from '../components/Specimen';

const principles = [
  {
    icon: Feather,
    number: '01',
    title: 'Express with restraint',
    copy: 'One memorable gesture is worth more than a surface full of decoration. Let the spiral, a fine rule, or a luminous pause carry the voice.',
  },
  {
    icon: ScanLine,
    number: '02',
    title: 'Make precision visible',
    copy: 'Measured intervals, deliberate hierarchy, and exact states turn intricacy into clarity. Ornament must never obscure the work.',
  },
  {
    icon: CircleGauge,
    number: '03',
    title: 'Leave room to breathe',
    copy: 'Spacious compositions and slower transitions give people time to orient. Calm is an operational quality, not an absence of character.',
  },
];

const colors = [
  { name: 'Tidal ink', token: '--bard-ink-950', value: '#082F2E', className: 'ink', note: 'Primary text and decisive actions' },
  { name: 'Mineral paper', token: '--bard-paper', value: '#F7F9F3', className: 'paper', note: 'The principal reading surface' },
  { name: 'Pale mint', token: '--bard-mint-200', value: '#D9E9DC', className: 'mint', note: 'Quiet grouping and selection' },
  { name: 'Still aqua', token: '--bard-aqua-200', value: '#C4E2DF', className: 'aqua', note: 'Informational accents and diagrams' },
  { name: 'Iris lilac', token: '--bard-lilac-200', value: '#DCD3E4', className: 'lilac', note: 'Expressive highlights, not body text' },
  { name: 'Burnished gold', token: '--bard-gold-500', value: '#AA7838', className: 'gold', note: 'Sparse ceremonial details' },
];

export function IdentitySection() {
  return (
    <section id="identity" className="bard-section" aria-labelledby="identity-title">
      <Reveal><SectionHeader number="01" eyebrow="Identity & principles" title="An instrument for composed expression." description="Bard brings the fine precision of an engraved line into a modern interface: lyrical at first glance, exacting in use." /></Reveal>
      <div className="bard-identity-grid">
        <Reveal className="bard-identity-art">
          <GuillocheField />
          <SpiralSigil className="bard-identity-art__sigil" animated />
          <span className="bard-identity-art__caption">THE SPIRAL STUDY · FIG. 01</span>
        </Reveal>
        <div className="bard-principles">
          {principles.map(({ icon: Icon, ...principle }) => (
            <Reveal className="bard-principle" key={principle.number}>
              <div className="bard-principle__top"><Icon size={20} strokeWidth={1.5} aria-hidden="true" /><span>{principle.number}</span></div>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ColorSection() {
  return (
    <section id="color" className="bard-section" aria-labelledby="color-title">
      <Reveal><SectionHeader number="02" eyebrow="Color" title="Mineral light. Tidal depth." description="A cool, iridescent palette with a firmly grounded ink. Color organizes meaning; pale tints carry atmosphere while deep green carries language." /></Reveal>
      <div className="bard-color-grid">
        {colors.map((color) => (
          <Reveal className="bard-color" key={color.token}>
            <div className={`bard-color__swatch bard-color__swatch--${color.className}`} aria-hidden="true"><span>{color.value}</span></div>
            <div className="bard-color__body"><h3>{color.name}</h3><p>{color.note}</p><code>{color.token}</code><CopyButton value={color.value} label={`Copy ${color.name}`} /></div>
          </Reveal>
        ))}
      </div>
      <Reveal className="bard-color-guidance">
        <div><span className="bard-color-guidance__ratio">14.6:1</span><p><strong>Ink on mineral paper</strong><br />Primary copy exceeds WCAG AA for all text sizes.</p></div>
        <div><span className="bard-color-guidance__ratio">4.8:1</span><p><strong>Muted ink on mineral paper</strong><br />Secondary copy retains readable contrast.</p></div>
        <p className="bard-color-guidance__note">Use pale lilac and mint as surfaces, never as a substitute for legible text. Verify any new pairing rather than relying on token names alone.</p>
      </Reveal>
    </section>
  );
}

export function TypographySection() {
  return (
    <section id="typography" className="bard-section" aria-labelledby="typography-title">
      <Reveal><SectionHeader number="03" eyebrow="Typography" title="A lyrical voice, plainly spoken." description="Cormorant Garamond lends ceremony to display moments. Manrope keeps controls, dense information, and long-form reading open and exact." /></Reveal>
      <Reveal className="bard-type-hero">
        <div className="bard-type-hero__letters" aria-hidden="true">Aa</div>
        <div><p className="bard-eyebrow">Cormorant Garamond · Variable</p><h3>Give the idea room to resonate.</h3><p>Display / 64–104px / Weight 450 / Line height 0.96</p></div>
      </Reveal>
      <div className="bard-type-grid">
        <Reveal className="bard-type-scale">
          <h3>Measured scale</h3>
          <div className="bard-type-sample bard-type-sample--display"><span>Display</span><p>The shape of a thought</p><code>clamp(3rem, 8vw, 6.5rem) / 0.96</code></div>
          <div className="bard-type-sample bard-type-sample--title"><span>Section title</span><p>Intricacy, made intelligible</p><code>2.5–4rem / 1.04</code></div>
          <div className="bard-type-sample bard-type-sample--body"><span>Body</span><p>Language should be generous in measure and unambiguous in meaning. Use 65–75 characters as a comfortable upper line length.</p><code>1rem / 1.7</code></div>
          <div className="bard-type-sample bard-type-sample--label"><span>Label</span><p>Structured and quietly emphatic</p><code>0.75rem / 1.4 / +0.12em</code></div>
        </Reveal>
        <Reveal className="bard-ui-type">
          <p className="bard-eyebrow">Manrope · Variable</p>
          <h3>Interface language</h3>
          <p>Manrope’s open forms stay composed at small sizes and across long labels. Use sentence case, tabular numerals for aligned data, and weight—not reduced contrast—to establish hierarchy.</p>
          <dl><div><dt>Body</dt><dd>400 / 1.7</dd></div><div><dt>Emphasis</dt><dd>600</dd></div><div><dt>Controls</dt><dd>600 / 0.875rem</dd></div><div><dt>Data</dt><dd>500 / tabular nums</dd></div></dl>
          <blockquote>“Good typography makes the path through an idea feel inevitable.”</blockquote>
        </Reveal>
      </div>
    </section>
  );
}

export function FormSection() {
  return (
    <section id="form" className="bard-section" aria-labelledby="form-title">
      <Reveal><SectionHeader number="04" eyebrow="Space, shape & elevation" title="Soft geometry, exact intervals." description="A four-pixel rhythm sets the underlying order. Broad curves and fine borders make surfaces feel held, while shadows remain close to the page." /></Reveal>
      <div className="bard-form-grid">
        <Reveal className="bard-space-study">
          <div className="bard-study-heading"><h3>Spatial rhythm</h3><span>Base unit · 4px</span></div>
          {[4, 8, 16, 24, 32, 48, 64].map((space) => <div className="bard-space-row" key={space}><code>{space}</code><span style={{ width: `${space * 2}px` }} /><small>{space / 4}u</small></div>)}
          <p>Use smaller intervals inside a control and larger intervals between ideas. Space is the first indicator of relationship.</p>
        </Reveal>
        <Reveal className="bard-shape-study">
          <div className="bard-study-heading"><h3>Curvature</h3><span>Four purposeful radii</span></div>
          <div className="bard-radius-examples"><div className="radius-sm"><span>10</span></div><div className="radius-md"><span>16</span></div><div className="radius-lg"><span>28</span></div><div className="radius-pill"><span>∞</span></div></div>
          <p>Compact controls use compact radii. Reserve expansive curves for containers that can hold them without distortion.</p>
        </Reveal>
        <Reveal className="bard-elevation-study">
          <div className="bard-study-heading"><h3>Elevation</h3><span>Three quiet planes</span></div>
          <div className="bard-elevation-examples"><div className="elevation-low"><strong>Resting</strong><span>Cards, grouped fields</span></div><div className="elevation-mid"><strong>Raised</strong><span>Popovers, sticky context</span></div><div className="elevation-high"><strong>Focused</strong><span>Dialogs only</span></div></div>
        </Reveal>
      </div>
    </section>
  );
}
