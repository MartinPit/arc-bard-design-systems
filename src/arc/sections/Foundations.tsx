import { useState } from 'react';
import { ArrowRight, Check, MoveRight, Pause, Play } from 'lucide-react';
import { ArcLeaf, ArcStamp, RegistrationMark } from '../components/Brand';
import { Button } from '../components';
import { CopyToken } from '../components/Specimen';
import { SectionHeading } from '../components/SectionHeading';
import { ProtectedText } from '../components/ProtectedText';
import type { ArcTheme } from '../theme';
import { formatLedgerNumber, formatNumber, formatUnit } from '../intl';

export function IdentitySection() {
  return (
    <section id="identity" className="arc-section arc-identity" aria-labelledby="section-1">
      <SectionHeading number={1} eyebrow="Identity / principles" title="A Human Hand. A Precise System.">
        <ProtectedText>Arc</ProtectedText> pairs editorial warmth with exacting interaction. Organic forms carry expression; rules, type, and space carry meaning.
      </SectionHeading>
      <div className="arc-identity__grid">
        <div className="arc-identity__leaf-sheet">
          <span className="arc-registration-note">PLATE {formatLedgerNumber(1)} / ORIGIN</span>
          <ArcLeaf />
          <ArcStamp compact />
          <p className="arc-identity__caption">One asymmetric gesture, held by a measured frame.</p>
        </div>
        <ol className="arc-principles">
          <li>
            <span className="arc-principles__number">I</span>
            <div><h3>Editorial Before Ornamental</h3><p>Lead with a clear reading order. Decorative gestures frame content rather than compete with it.</p></div>
          </li>
          <li>
            <span className="arc-principles__number">II</span>
            <div><h3>Warmth Without Softness</h3><p>Ivory paper and botanical curves meet crisp outlines, exact alignment, and decisive state changes.</p></div>
          </li>
          <li>
            <span className="arc-principles__number">III</span>
            <div><h3>Accent with Intention</h3><p>Marigold, coral, and magenta mark moments of energy. Aubergine carries essential text and controls.</p></div>
          </li>
        </ol>
      </div>
      <div className="arc-identity__notes">
        <p><strong>Use <ProtectedText>Arc</ProtectedText> when</strong> the experience benefits from authored character, thoughtful pacing, and tangible detail.</p>
        <p><strong>Keep it legible</strong> by retaining generous negative space and limiting each composition to one expressive focal point.</p>
      </div>
    </section>
  );
}

const colors = [
  { name: 'Paper', token: '--arc-paper', value: { light: '#F4EFE4', dark: '#171019' }, usage: 'Page ground', tone: 'paper' },
  { name: 'Raised Paper', token: '--arc-paper-raised', value: { light: '#FFFAF0', dark: '#211625' }, usage: 'Fields & overlays', tone: 'raised' },
  { name: 'Aubergine', token: '--arc-aubergine', value: { light: '#3C1949', dark: '#C4A1CE' }, usage: 'Primary action', tone: 'aubergine' },
  { name: 'Ink', token: '--arc-ink', value: { light: '#27132F', dark: '#F2E6D3' }, usage: 'Essential text', tone: 'ink' },
  { name: 'Ruled Purple', token: '--arc-purple', value: { light: '#684477', dark: '#AA87B5' }, usage: 'Focus & outlines', tone: 'purple' },
  { name: 'Marigold', token: '--arc-marigold', value: { light: '#EDAE2B', dark: '#F0BC4F' }, usage: 'Highlights', tone: 'marigold' },
  { name: 'Coral', token: '--arc-coral', value: { light: '#DF5D58', dark: '#E97971' }, usage: 'Expressive accents', tone: 'coral' },
  { name: 'Magenta', token: '--arc-magenta', value: { light: '#A92367', dark: '#D75B96' }, usage: 'Graphic moments', tone: 'magenta' },
];

export function ColorSection({ theme }: { theme: ArcTheme }) {
  return (
    <section id="color" className="arc-section" aria-labelledby="section-2">
      <SectionHeading number={2} eyebrow="Foundation / color" title="Ink First. Pigment Second.">
        Color behaves like a considered print run: quiet stocks, dark readable ink, and small areas of saturated pigment.
      </SectionHeading>
      <div className="arc-color-grid">
        {colors.map((color, index) => (
          <article className={`arc-swatch arc-swatch--${color.tone}`} key={color.token}>
            <div className="arc-swatch__color">
              <span>{formatLedgerNumber(index + 1)}</span>
              {color.tone === 'marigold' && <span className="arc-swatch__sun" aria-hidden="true" />}
            </div>
            <div className="arc-swatch__body">
              <h3>{color.name}</h3>
              <p>{color.usage}</p>
              <CopyToken value={color.value[theme]} label={color.name} />
              <code translate="no" className="notranslate">{color.token}</code>
            </div>
          </article>
        ))}
      </div>
      <div className="arc-color-guidance">
        <div className="arc-gradient-strip" role="img" aria-label="Arc accent gradient, marigold through orange and coral to magenta" aria-describedby="arc-gradient-guidance">
          <span id="arc-gradient-guidance">EXPRESSIVE PRINT / USE SPARINGLY</span>
        </div>
        <div className="arc-color-guidance__copy">
          <h3>Accent Is Not Body Copy</h3>
          <p>Use aubergine or ink for text on ivory. The gradient belongs in leaf artwork, selected rules, and compact illustration—not paragraphs or control labels.</p>
          <div className="arc-contrast-samples">
            <span className="arc-contrast-sample arc-contrast-sample--good"><Check size={15} aria-hidden="true" /> Ink on paper</span>
            <span className="arc-contrast-sample arc-contrast-sample--bad">Avoid magenta body text</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TypographySection() {
  return (
    <section id="typography" className="arc-section" aria-labelledby="section-3">
      <SectionHeading number={3} eyebrow="Foundation / typography" title="A Voice with Grain and Structure.">
        <ProtectedText>Fraunces</ProtectedText> gives headings their literary cadence. <ProtectedText>Inter</ProtectedText> handles reading and interaction; <ProtectedText>IBM Plex Mono</ProtectedText> records the system’s metadata.
      </SectionHeading>
      <div className="arc-type-ledger">
        <article className="arc-type-display">
          <div className="arc-type-meta"><span>DISPLAY / <ProtectedText>FRAUNCES VARIABLE</ProtectedText></span><span>64–160 / 0.92</span></div>
          <p>Curious<br /><em>by nature.</em></p>
          <div className="arc-type-baseline" aria-hidden="true"><span>BASELINE</span></div>
        </article>
        <div className="arc-type-stack">
          <article>
            <div className="arc-type-meta"><span>HEADING / <ProtectedText>FRAUNCES</ProtectedText></span><span>32–52 / 1.05</span></div>
            <h3>Form Follows Feeling.</h3>
            <p>Use a softly weighted serif for titles, never for dense interface copy.</p>
          </article>
          <article>
            <div className="arc-type-meta"><span>BODY / <ProtectedText>INTER VARIABLE</ProtectedText></span><span>15–18 / 1.6</span></div>
            <p className="arc-type-body"><ProtectedText>Arc</ProtectedText> makes room for nuance without losing clarity. Body styles favor a comfortable measure, steady rhythm, and language that tells people what happens next.</p>
          </article>
          <article>
            <div className="arc-type-meta"><span>LABEL / <ProtectedText>IBM PLEX MONO</ProtectedText></span><span>11–13 / 1.4</span></div>
            <p className="arc-type-mono">REGISTER {formatLedgerNumber(4)} — <ProtectedText>TOKEN / SPECIMEN / STATUS</ProtectedText></p>
          </article>
        </div>
      </div>
      <ol className="arc-type-scale" aria-label="Recommended type scale">
        {[['Hero', 'arc-type-scale--hero'], ['Title', 'arc-type-scale--title'], ['Heading', 'arc-type-scale--heading'], ['Body copy', 'arc-type-scale--body'], ['Interface', 'arc-type-scale--ui'], ['MONO LABEL', 'arc-type-scale--mono']].map(([label, className], index) => (
          <li key={label}><span>{formatLedgerNumber(index + 1)}</span><p className={className}>{label}</p></li>
        ))}
      </ol>
    </section>
  );
}

const spaces = [
  { step: 1, pixels: 4, usage: 'Hairline Offset' }, { step: 2, pixels: 8, usage: 'Icon Gap' }, { step: 3, pixels: 12, usage: 'Compact Inset' },
  { step: 4, pixels: 16, usage: 'Control Padding' }, { step: 5, pixels: 24, usage: 'Content Group' }, { step: 6, pixels: 32, usage: 'Card Inset' },
  { step: 7, pixels: 48, usage: 'Section Split' }, { step: 8, pixels: 64, usage: 'Large Gap' }, { step: 9, pixels: 96, usage: 'Section Breath' },
];

export function ShapeSection() {
  return (
    <section id="shape" className="arc-section" aria-labelledby="section-4">
      <SectionHeading number={4} eyebrow="Foundation / space, shape, elevation" title="Measured, Never Mechanical.">
        A 4-pixel base grid anchors the interface. Selective asymmetry and hard offset shadows make containers feel printed, not inflated.
      </SectionHeading>
      <div className="arc-space-layout">
        <div className="arc-space-scale">
          <h3>Spacing Scale <span>{formatUnit(4, 'px')} Base</span></h3>
          {spaces.map(({ step, pixels, usage }) => (
            <div className="arc-space-row" key={step}>
              <span>{formatNumber(step)}</span><code translate="no" className="notranslate">{formatNumber(pixels)}</code>
              <span className="arc-space-row__bar" style={{ width: `${Math.min(pixels, 96)}px` }} aria-hidden="true" />
              <span>{usage}</span>
            </div>
          ))}
        </div>
        <div className="arc-shape-study">
          <RegistrationMark />
          <span className="arc-eyebrow">SIGNATURE CONTOUR</span>
          <div className="arc-shape-study__leaf" aria-hidden="true"><span /></div>
          <h3>One Irregular Edge</h3>
          <p>Use a leaf-like radius on artwork or a featured surface. Keep inputs and repeated containers predictable.</p>
          <code translate="no" className="notranslate">border-radius: 64% 18% 58% 24% / 42% 62% 28% 56%</code>
        </div>
      </div>
      <div className="arc-elevation-grid">
        <article className="arc-elevation-card arc-elevation-card--flat"><span>{formatLedgerNumber(0)} / FLUSH</span><h3>Ruled</h3><p>1 px line for peers and nested regions.</p></article>
        <article className="arc-elevation-card arc-elevation-card--raised"><span>{formatLedgerNumber(1)} / RAISED</span><h3>Offset</h3><p>A hard, low-opacity shadow for cards.</p></article>
        <article className="arc-elevation-card arc-elevation-card--overlay"><span>{formatLedgerNumber(2)} / OVERLAY</span><h3>Lifted</h3><p>A deeper offset reserved for dialogue.</p></article>
      </div>
    </section>
  );
}

export function MotionSection() {
  const [playKey, setPlayKey] = useState(0);
  const [playing, setPlaying] = useState(true);
  return (
    <section id="motion" className="arc-section" aria-labelledby="section-5">
      <SectionHeading number={5} eyebrow="Foundation / motion" title="A Turn of the Press.">
        Movement is brief, directional, and informative. It confirms a change of state, then gets out of the way.
      </SectionHeading>
      <div className="arc-motion-layout">
        <div className="arc-motion-stage">
          <div className="arc-motion-stage__meta"><span>REGISTERED MOTION</span><span>{playing ? 'RUNNING ON REQUEST' : 'PAUSED'}</span></div>
          <div className={`arc-motion-proof ${playing ? 'is-playing' : ''}`} key={playKey} aria-hidden="true">
            <span className="arc-motion-proof__paper" />
            <span className="arc-motion-proof__ink" />
            <span className="arc-motion-proof__leaf" />
          </div>
          <div className="arc-motion-stage__actions">
            <Button variant="secondary" onClick={() => { setPlaying(true); setPlayKey((key) => key + 1); }}>
              <Play size={15} aria-hidden="true" /> Replay Impression
            </Button>
            <Button variant="quiet" onClick={() => setPlaying((value) => !value)}>
              {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
              {playing ? 'Pause' : 'Play'}
            </Button>
          </div>
        </div>
        <div className="arc-motion-specs">
          <article><MoveRight aria-hidden="true" /><span>{formatUnit(120, 'ms')}</span><h3>Direct Response</h3><p>Hover, press, icon changes. No delay between intent and acknowledgement.</p></article>
          <article><ArrowRight aria-hidden="true" /><span>{formatUnit(200, 'ms')}</span><h3>Spatial Change</h3><p>Dialogs, toasts, and disclosure use opacity with a short 8–16 px translation.</p></article>
          <article><Pause aria-hidden="true" /><span>{formatUnit(0, 'ms')}</span><h3>Reduced Motion</h3><p>Remove nonessential transforms when the operating system asks for less motion.</p></article>
        </div>
      </div>
      <p className="arc-foundation-note"><strong>Rule:</strong> never loop decorative motion. Keep functional progress indicators visible and provide text for loading states.</p>
    </section>
  );
}
