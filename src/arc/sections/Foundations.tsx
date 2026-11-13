import { useState } from 'react';
import { ArrowRight, Check, MoveRight, Pause, Play } from 'lucide-react';
import { ArcLeaf, ArcStamp, RegistrationMark } from '../components/Brand';
import { Button } from '../components';
import { CopyToken } from '../components/Specimen';
import { SectionHeading } from '../components/SectionHeading';

export function IdentitySection() {
  return (
    <section id="identity" className="arc-section arc-identity" aria-labelledby="section-01">
      <SectionHeading number="01" eyebrow="Identity / principles" title="A human hand. A precise system.">
        Arc pairs editorial warmth with exacting interaction. Organic forms carry expression; rules, type, and space carry meaning.
      </SectionHeading>
      <div className="arc-identity__grid">
        <div className="arc-identity__leaf-sheet">
          <span className="arc-registration-note">PLATE 01 / ORIGIN</span>
          <ArcLeaf />
          <ArcStamp compact />
          <p className="arc-identity__caption">One asymmetric gesture, held by a measured frame.</p>
        </div>
        <ol className="arc-principles">
          <li>
            <span className="arc-principles__number">I</span>
            <div><h3>Editorial before ornamental</h3><p>Lead with a clear reading order. Decorative gestures frame content rather than compete with it.</p></div>
          </li>
          <li>
            <span className="arc-principles__number">II</span>
            <div><h3>Warmth without softness</h3><p>Ivory paper and botanical curves meet crisp outlines, exact alignment, and decisive state changes.</p></div>
          </li>
          <li>
            <span className="arc-principles__number">III</span>
            <div><h3>Accent with intention</h3><p>Marigold, coral, and magenta mark moments of energy. Aubergine carries essential text and controls.</p></div>
          </li>
        </ol>
      </div>
      <div className="arc-identity__notes">
        <p><strong>Use Arc when</strong> the experience benefits from authored character, thoughtful pacing, and tangible detail.</p>
        <p><strong>Keep it legible</strong> by retaining generous negative space and limiting each composition to one expressive focal point.</p>
      </div>
    </section>
  );
}

const colors = [
  { name: 'Paper', token: '--arc-paper', value: '#F4EFE4', usage: 'Page ground', tone: 'paper' },
  { name: 'Raised paper', token: '--arc-paper-raised', value: '#FFFAF0', usage: 'Fields & overlays', tone: 'raised' },
  { name: 'Aubergine', token: '--arc-aubergine', value: '#3C1949', usage: 'Primary action', tone: 'aubergine' },
  { name: 'Ink', token: '--arc-ink', value: '#27132F', usage: 'Essential text', tone: 'ink' },
  { name: 'Ruled purple', token: '--arc-purple', value: '#684477', usage: 'Focus & outlines', tone: 'purple' },
  { name: 'Marigold', token: '--arc-marigold', value: '#EDAE2B', usage: 'Highlights', tone: 'marigold' },
  { name: 'Coral', token: '--arc-coral', value: '#DF5D58', usage: 'Expressive accents', tone: 'coral' },
  { name: 'Magenta', token: '--arc-magenta', value: '#A92367', usage: 'Graphic moments', tone: 'magenta' },
];

export function ColorSection() {
  return (
    <section id="color" className="arc-section" aria-labelledby="section-02">
      <SectionHeading number="02" eyebrow="Foundation / color" title="Ink first. Pigment second.">
        Color behaves like a considered print run: quiet stocks, dark readable ink, and small areas of saturated pigment.
      </SectionHeading>
      <div className="arc-color-grid">
        {colors.map((color, index) => (
          <article className={`arc-swatch arc-swatch--${color.tone}`} key={color.token}>
            <div className="arc-swatch__color">
              <span>{String(index + 1).padStart(2, '0')}</span>
              {color.tone === 'marigold' && <span className="arc-swatch__sun" aria-hidden="true" />}
            </div>
            <div className="arc-swatch__body">
              <h3>{color.name}</h3>
              <p>{color.usage}</p>
              <CopyToken value={color.value} label={color.name} />
              <code>{color.token}</code>
            </div>
          </article>
        ))}
      </div>
      <div className="arc-color-guidance">
        <div className="arc-gradient-strip" aria-label="Arc accent gradient, marigold through orange and coral to magenta">
          <span>EXPRESSIVE PRINT / USE SPARINGLY</span>
        </div>
        <div className="arc-color-guidance__copy">
          <h3>Accent is not body copy</h3>
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
    <section id="typography" className="arc-section" aria-labelledby="section-03">
      <SectionHeading number="03" eyebrow="Foundation / typography" title="A voice with grain and structure.">
        Fraunces gives headings their literary cadence. Inter handles reading and interaction; IBM Plex Mono records the system’s metadata.
      </SectionHeading>
      <div className="arc-type-ledger">
        <article className="arc-type-display">
          <div className="arc-type-meta"><span>DISPLAY / FRAUNCES VARIABLE</span><span>64–160 / 0.92</span></div>
          <p>Curious<br /><em>by nature.</em></p>
          <div className="arc-type-baseline" aria-hidden="true"><span>BASELINE</span></div>
        </article>
        <div className="arc-type-stack">
          <article>
            <div className="arc-type-meta"><span>HEADING / FRAUNCES</span><span>32–52 / 1.05</span></div>
            <h3>Form follows feeling.</h3>
            <p>Use a softly weighted serif for titles, never for dense interface copy.</p>
          </article>
          <article>
            <div className="arc-type-meta"><span>BODY / INTER VARIABLE</span><span>15–18 / 1.6</span></div>
            <p className="arc-type-body">Arc makes room for nuance without losing clarity. Body styles favor a comfortable measure, steady rhythm, and language that tells people what happens next.</p>
          </article>
          <article>
            <div className="arc-type-meta"><span>LABEL / IBM PLEX MONO</span><span>11–13 / 1.4</span></div>
            <p className="arc-type-mono">REGISTER 04 — TOKEN / SPECIMEN / STATUS</p>
          </article>
        </div>
      </div>
      <div className="arc-type-scale" aria-label="Recommended type scale">
        {[['Hero', 'arc-type-scale--hero'], ['Title', 'arc-type-scale--title'], ['Heading', 'arc-type-scale--heading'], ['Body copy', 'arc-type-scale--body'], ['Interface', 'arc-type-scale--ui'], ['MONO LABEL', 'arc-type-scale--mono']].map(([label, className], index) => (
          <div key={label}><span>{String(index + 1).padStart(2, '0')}</span><p className={className}>{label}</p></div>
        ))}
      </div>
    </section>
  );
}

const spaces = [
  ['1', '4', 'Hairline offset'], ['2', '8', 'Icon gap'], ['3', '12', 'Compact inset'],
  ['4', '16', 'Control padding'], ['5', '24', 'Content group'], ['6', '32', 'Card inset'],
  ['7', '48', 'Section split'], ['8', '64', 'Large gap'], ['9', '96', 'Section breath'],
];

export function ShapeSection() {
  return (
    <section id="shape" className="arc-section" aria-labelledby="section-04">
      <SectionHeading number="04" eyebrow="Foundation / space, shape, elevation" title="Measured, never mechanical.">
        A four-pixel base grid anchors the interface. Selective asymmetry and hard offset shadows make containers feel printed, not inflated.
      </SectionHeading>
      <div className="arc-space-layout">
        <div className="arc-space-scale">
          <h3>Spacing scale <span>4 px base</span></h3>
          {spaces.map(([step, pixels, usage]) => (
            <div className="arc-space-row" key={step}>
              <span>{step}</span><code>{pixels}</code>
              <span className="arc-space-row__bar" style={{ width: `${Math.min(Number(pixels), 96)}px` }} aria-hidden="true" />
              <span>{usage}</span>
            </div>
          ))}
        </div>
        <div className="arc-shape-study">
          <RegistrationMark />
          <span className="arc-eyebrow">SIGNATURE CONTOUR</span>
          <div className="arc-shape-study__leaf" aria-hidden="true"><span /></div>
          <h3>One irregular edge</h3>
          <p>Use a leaf-like radius on artwork or a featured surface. Keep inputs and repeated containers predictable.</p>
          <code>border-radius: 64% 18% 58% 24% / 42% 62% 28% 56%</code>
        </div>
      </div>
      <div className="arc-elevation-grid">
        <article className="arc-elevation-card arc-elevation-card--flat"><span>00 / FLUSH</span><h3>Ruled</h3><p>1px line for peers and nested regions.</p></article>
        <article className="arc-elevation-card arc-elevation-card--raised"><span>01 / RAISED</span><h3>Offset</h3><p>A hard, low-opacity shadow for cards.</p></article>
        <article className="arc-elevation-card arc-elevation-card--overlay"><span>02 / OVERLAY</span><h3>Lifted</h3><p>A deeper offset reserved for dialogue.</p></article>
      </div>
    </section>
  );
}

export function MotionSection() {
  const [playKey, setPlayKey] = useState(0);
  const [playing, setPlaying] = useState(true);
  return (
    <section id="motion" className="arc-section" aria-labelledby="section-05">
      <SectionHeading number="05" eyebrow="Foundation / motion" title="A turn of the press.">
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
              <Play size={15} aria-hidden="true" /> Replay impression
            </Button>
            <Button variant="quiet" onClick={() => setPlaying((value) => !value)}>
              {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
              {playing ? 'Pause' : 'Play'}
            </Button>
          </div>
        </div>
        <div className="arc-motion-specs">
          <article><MoveRight aria-hidden="true" /><span>120 ms</span><h3>Direct response</h3><p>Hover, press, icon changes. No delay between intent and acknowledgement.</p></article>
          <article><ArrowRight aria-hidden="true" /><span>200 ms</span><h3>Spatial change</h3><p>Dialogs, toasts, and disclosure use opacity with a short 8–16px translation.</p></article>
          <article><Pause aria-hidden="true" /><span>0 ms</span><h3>Reduced motion</h3><p>Remove nonessential transforms when the operating system asks for less motion.</p></article>
        </div>
      </div>
      <p className="arc-foundation-note"><strong>Rule:</strong> never loop decorative motion. Keep functional progress indicators visible and provide text for loading states.</p>
    </section>
  );
}
