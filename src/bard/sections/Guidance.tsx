import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, Eye, Keyboard, MousePointer2, Play, RotateCcw, ShieldCheck, Volume2, X } from 'lucide-react';
import { Button, Badge, SelectField, SwitchField } from '../components';
import { Reveal, SectionHeader } from '../components/Specimen';

function MotionPreview() {
  const reduceMotion = useReducedMotion();
  const [cycle, setCycle] = useState(0);
  return (
    <div className="bard-motion-preview">
      <div className="bard-motion-preview__stage" aria-live="polite">
        <motion.div
          key={cycle}
          className="bard-motion-preview__object"
          initial={reduceMotion ? false : { opacity: 0, y: 22, clipPath: 'inset(0 0 100% 0 round 28px)' }}
          animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0 round 28px)' }}
          transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="bard-eyebrow">Principle 02</span>
          <strong>Reveal the idea,<br />not the mechanics.</strong>
          <span className="bard-motion-preview__line" aria-hidden="true" />
        </motion.div>
      </div>
      <Button variant="secondary" onClick={() => setCycle((value) => value + 1)}>{cycle ? <RotateCcw size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}{cycle ? 'Replay reveal' : 'Play reveal'}</Button>
      <p>{reduceMotion ? 'Reduced motion is active: content appears without travel or masking.' : 'A single, 1.1-second masked entrance. Replay only on request.'}</p>
    </div>
  );
}

export function MotionSection() {
  return (
    <section id="motion" className="bard-section" aria-labelledby="motion-title">
      <Reveal><SectionHeader number="05" eyebrow="Motion" title="Movement with a sense of occasion." description="Motion connects cause and effect. Entrances are slow enough to feel intentional, overlays are fluid, and decorative movement yields immediately to reduced-motion settings." /></Reveal>
      <div className="bard-motion-grid">
        <Reveal className="bard-motion-notes">
          <article><span>01</span><div><h3>Arrive with composure</h3><p>Use masked vertical reveals to establish hierarchy. Keep travel under 32px and animate each section once.</p><code>850ms · cubic-bezier(.22, 1, .36, 1)</code></div></article>
          <article><span>02</span><div><h3>Keep responses immediate</h3><p>Hover, press, and focus feedback belongs in the 120–200ms range, even when ceremonial entrances are slower.</p><code>160ms · state transitions</code></div></article>
          <article><span>03</span><div><h3>Let stillness be complete</h3><p>Avoid autoplaying emphasis. When reduced motion is requested, remove travel, masks, parallax, and ambient pattern drift.</p><code>prefers-reduced-motion: reduce</code></div></article>
        </Reveal>
        <Reveal><MotionPreview /></Reveal>
      </div>
    </section>
  );
}

function NotificationPreferences() {
  const [settings, setSettings] = useState({ summary: true, mentions: true, ambient: false });
  const [frequency, setFrequency] = useState('weekly');
  const [saved, setSaved] = useState(false);
  function update(key: keyof typeof settings, value: boolean) {
    setSettings({ ...settings, [key]: value });
    setSaved(false);
  }
  return (
    <div className="bard-fragment bard-notification-fragment">
      <div className="bard-fragment__heading"><div><p className="bard-eyebrow">Generic fragment</p><h3>Notification preferences</h3></div><Badge tone={saved ? 'success' : 'neutral'}>{saved ? 'Saved' : 'Local only'}</Badge></div>
      <p>Choose the signals that deserve your attention. Changes here affect only this demonstration.</p>
      <div className="bard-preference-list">
        <SwitchField label="Activity summary" description="A considered digest of recent changes." checked={settings.summary} onCheckedChange={(value) => update('summary', value)} />
        <SwitchField label="Direct mentions" description="Let me know when a response is requested." checked={settings.mentions} onCheckedChange={(value) => update('mentions', value)} />
        <SwitchField label="Ambient updates" description="Show low-priority activity as it happens." checked={settings.ambient} onCheckedChange={(value) => update('ambient', value)} />
      </div>
      <SelectField label="Digest frequency" value={frequency} onChange={(value) => { setFrequency(value); setSaved(false); }} options={[{ value: 'daily', label: 'Each weekday' }, { value: 'weekly', label: 'Once a week' }, { value: 'never', label: 'Do not send a digest' }]} />
      <div className="bard-fragment__footer"><span aria-live="polite">{saved ? 'Preferences updated.' : 'No changes leave your browser.'}</span><Button onClick={() => setSaved(true)}>Save preferences</Button></div>
    </div>
  );
}

function ResourceSummary() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bard-fragment bard-resource-fragment">
      <div className="bard-fragment__heading"><div><p className="bard-eyebrow">Generic fragment</p><h3>Resource summary</h3></div><span className="bard-resource-count">12</span></div>
      <p>A small collection arranged by theme, with no account or product-specific assumptions.</p>
      <div className="bard-resource-list">
        <a href="#color"><span><small>Foundation</small><strong>Color &amp; contrast</strong></span><Badge>4 entries</Badge><ArrowRight size={17} aria-hidden="true" /></a>
        <a href="#components"><span><small>Library</small><strong>Interaction patterns</strong></span><Badge tone="lilac">5 entries</Badge><ArrowRight size={17} aria-hidden="true" /></a>
        <a href="#accessibility"><span><small>Practice</small><strong>Review guidance</strong></span><Badge tone="success">3 entries</Badge><ArrowRight size={17} aria-hidden="true" /></a>
      </div>
      {expanded && <div className="bard-resource-aside"><strong>Collection note</strong><p>Start with foundations, adopt components in context, then run the accessibility review before release.</p></div>}
      <Button variant="quiet" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? 'Hide collection note' : 'Show collection note'}<ArrowRight size={15} aria-hidden="true" /></Button>
    </div>
  );
}

export function CompositionSection() {
  return (
    <section id="composition" className="bard-section" aria-labelledby="composition-title">
      <Reveal><SectionHeader number="07" eyebrow="Composition" title="Parts become a quiet whole." description="Generic fragments demonstrate hierarchy and relationships without inventing a product. Repeated structures stay familiar; expressive details remain at the edges." /></Reveal>
      <div className="bard-composition-grid">
        <Reveal><NotificationPreferences /></Reveal>
        <Reveal><ResourceSummary /></Reveal>
      </div>
      <Reveal className="bard-composition-note"><span aria-hidden="true">✦</span><p><strong>Build from reading order outward.</strong> Headings establish the task, supporting copy answers the next question, controls sit close to their consequences, and status appears where attention already is.</p></Reveal>
    </section>
  );
}

export function UsageSection() {
  return (
    <section id="usage" className="bard-section" aria-labelledby="usage-title">
      <Reveal><SectionHeader number="08" eyebrow="Usage guidance" title="Let character serve the content." description="Bard is most convincing when its expression is concentrated and its operational surfaces are calm. These decisions keep the system recognizable without making it theatrical." /></Reveal>
      <div className="bard-usage-grid">
        <Reveal className="bard-usage-card bard-usage-card--do"><div className="bard-usage-card__title"><Check size={20} aria-hidden="true" /><h3>Compose with intention</h3></div><ul><li>Place the spiral in identity moments, not in every component.</li><li>Use display type for short, meaningful phrases.</li><li>Keep form labels, errors, and data on quiet solid surfaces.</li><li>Pair a status tint with a plain-language status word.</li><li>Allow content and translation to wrap without fixed heights.</li></ul><div className="bard-usage-example bard-usage-example--do"><span className="bard-eyebrow">A clear invitation</span><strong>Continue when you are ready.</strong><Button>Continue</Button></div></Reveal>
        <Reveal className="bard-usage-card bard-usage-card--dont"><div className="bard-usage-card__title"><X size={20} aria-hidden="true" /><h3>Avoid decorative noise</h3></div><ul><li>Do not layer small text over guilloché or iridescent fields.</li><li>Do not use low-contrast tints to communicate disabled text.</li><li>Do not turn every container into a floating rounded card.</li><li>Do not delay an interaction to make animation noticeable.</li><li>Do not encode success, warnings, or selection in hue alone.</li></ul><div className="bard-usage-example bard-usage-example--dont" aria-hidden="true"><span>MAKE EVERY MOMENT MOVE</span><strong>Ornament everywhere, all at once.</strong><i /></div></Reveal>
      </div>
      <Reveal className="bard-voice"><p className="bard-eyebrow">Editorial voice</p><blockquote>“Specific enough to help. Spacious enough to think.”</blockquote><div><p><strong>Use:</strong> “Choose a digest frequency.”</p><p><strong>Avoid:</strong> “Let’s orchestrate your notification journey.”</p></div></Reveal>
    </section>
  );
}

export function AccessibilitySection() {
  return (
    <section id="accessibility" className="bard-section" aria-labelledby="accessibility-title">
      <Reveal><SectionHeader number="09" eyebrow="Accessibility" title="The detail includes everyone." description="Accessibility is part of Bard’s composition, not an approval step at the end. Semantics, contrast, keyboard support, and reduced motion are inherent to every specimen." /></Reveal>
      <div className="bard-access-grid">
        <Reveal className="bard-access-principles">
          <article><Keyboard size={23} strokeWidth={1.5} aria-hidden="true" /><h3>Keyboard complete</h3><p>All actions are reachable, focus is visible, overlays support Escape, and dialog focus returns to its trigger.</p></article>
          <article><Eye size={23} strokeWidth={1.5} aria-hidden="true" /><h3>Perceptibly clear</h3><p>Readable text contrast, labelled controls, text-based statuses, and no information carried by pattern or color alone.</p></article>
          <article><Volume2 size={23} strokeWidth={1.5} aria-hidden="true" /><h3>Assistively expressed</h3><p>One page h1, ordered headings, explicit icon labels, live-region feedback, and native field semantics.</p></article>
          <article><ShieldCheck size={23} strokeWidth={1.5} aria-hidden="true" /><h3>Preference aware</h3><p>Reduced motion removes reveals and ambient drift. Touch targets and responsive zoom reflow are part of review.</p></article>
        </Reveal>
        <Reveal className="bard-keyboard-guide">
          <div className="bard-study-heading"><h3>Keyboard reference</h3><MousePointer2 size={18} aria-hidden="true" /></div>
          <dl><div><dt><kbd>Tab</kbd></dt><dd>Move between interactive elements</dd></div><div><dt><kbd>Space</kbd></dt><dd>Toggle buttons, checkboxes, and switches</dd></div><div><dt><kbd>←</kbd><kbd>→</kbd></dt><dd>Move within tabs, radios, and sliders</dd></div><div><dt><kbd>Esc</kbd></dt><dd>Dismiss dialogs, popovers, and tooltips</dd></div><div><dt><kbd>Enter</kbd></dt><dd>Open a selected item or confirm an action</dd></div></dl>
          <div className="bard-focus-note"><span aria-hidden="true" />The iris focus ring maintains separation on both pale and dark surfaces.</div>
        </Reveal>
      </div>
      <Reveal className="bard-review-strip"><span>Before release</span><p>Zoom to 200%</p><i /><p>Test keyboard only</p><i /><p>Inspect accessible names</p><i /><p>Verify real contrast</p><i /><p>Reduce motion</p></Reveal>
    </section>
  );
}
