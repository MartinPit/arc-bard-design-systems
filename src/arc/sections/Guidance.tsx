import { useMemo, useState } from 'react';
import { ArrowDownUp, ArrowRight, Bell, Check, FileText, Leaf, Search, X } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { ProtectedText } from '../components/ProtectedText';
import { Badge, Button, Checkbox, RadioGroup, Switch, TextInput } from '../components';
import { useShowcaseUrlState } from '../showcaseUrlState';
import { formatLedgerNumber, formatNumber, formatUnit } from '../intl';

export function CompositionSection() {
  const [digest, setDigest] = useState('weekly');
  const [mentions, setMentions] = useState(true);
  const [productNews, setProductNews] = useState(false);
  const [saved, setSaved] = useState(false);
  const { query, ascending, setQuery, setAscending } = useShowcaseUrlState();
  const resources = useMemo(() => {
    const items = [
      { title: 'Principles of Clear Revision', type: 'Guide', meta: { value: 8, unit: 'min' }, icon: <FileText aria-hidden="true" /> },
      { title: 'A Field Index of Botanical Forms', type: 'Reference', meta: { value: 124, unit: 'entries' }, icon: <Leaf aria-hidden="true" /> },
      { title: 'Writing a Useful Change Note', type: 'Pattern', meta: { value: 6, unit: 'min' }, icon: <FileText aria-hidden="true" /> },
    ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
    return ascending ? items : items.reverse();
  }, [query, ascending]);

  return (
    <section id="composition" className="arc-section" aria-labelledby="section-7">
      <SectionHeading number={7} eyebrow="System / composition" title="Small Arrangements, Same Language.">
        Components become useful through hierarchy and spacing, not through extra decoration. These generic fragments show two common arrangements.
      </SectionHeading>
      <div className="arc-composition-grid">
        <article className="arc-fragment arc-preference-fragment">
          <div className="arc-fragment__header"><div><p className="arc-eyebrow">FRAGMENT A / SETTINGS</p><h3>Notification Preferences</h3></div><Bell aria-hidden="true" /></div>
          <p>Choose which updates deserve attention. Changes below are local to this showcase.</p>
          <RadioGroup label="Summary cadence" name="fragment-cadence" value={digest} onChange={(value) => { setDigest(value); setSaved(false); }} options={[{ value: 'daily', label: 'Daily digest' }, { value: 'weekly', label: 'Weekly digest' }, { value: 'off', label: 'No digest' }]} />
          <div className="arc-fragment__switches">
            <Switch label="Direct mentions" description="Always send a separate notification." checked={mentions} onCheckedChange={(value) => { setMentions(value); setSaved(false); }} />
            <Checkbox label="Occasional product news" checked={productNews} onChange={(event) => { setProductNews(event.target.checked); setSaved(false); }} />
          </div>
          <div className="arc-fragment__footer"><span aria-live="polite">{saved ? <><Check size={15} aria-hidden="true" /> You Saved Preferences</> : 'Unsaved demonstration'}</span><Button onClick={() => setSaved(true)}>Save Preferences</Button></div>
        </article>
        <article className="arc-fragment arc-resource-fragment">
          <div className="arc-fragment__header"><div><p className="arc-eyebrow">FRAGMENT B / COLLECTION</p><h3>Resource Summary</h3></div><span className="arc-fragment__count">{formatNumber(resources.length)} / {formatNumber(3)}</span></div>
          <TextInput label="Filter resources" name="resource-filter" autoComplete="off" type="search" placeholder="Try “clear revision”…" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Button variant="quiet" className="arc-sort-button" onClick={() => setAscending(!ascending)}><ArrowDownUp size={15} aria-hidden="true" /> Title: {ascending ? 'A–Z' : 'Z–A'}</Button>
          <div className="arc-resource-list" aria-live="polite">
            {resources.length ? resources.map((resource) => (
              <a href="#guidance" className="arc-resource-row" key={resource.title}>{resource.icon}<span><strong>{resource.title}</strong><span>{resource.meta.unit === 'min' ? `${formatUnit(resource.meta.value, 'min')} read` : `${formatNumber(resource.meta.value)} entries`}</span></span><Badge>{resource.type}</Badge><ArrowRight size={16} aria-hidden="true" /></a>
            )) : <div className="arc-resource-empty"><Search aria-hidden="true" /><h4>No Matching Resources</h4><p>Try a broader title or clear the current filter.</p><Button variant="secondary" onClick={() => setQuery('', 'push')}>Clear Filter</Button></div>}
          </div>
        </article>
      </div>
      <p className="arc-foundation-note"><strong>Composition rule:</strong> one dominant task per region, related actions in close proximity, and no more than one expressive card treatment in a single view.</p>
    </section>
  );
}

export function GuidanceSection() {
  return (
    <section id="guidance" className="arc-section" aria-labelledby="section-8">
      <SectionHeading number={8} eyebrow="Practice / usage guidance" title="Make the Character Earn Its Place.">
        <ProtectedText>Arc</ProtectedText> is most convincing when expressive and practical decisions reinforce each other. Use these checks before introducing a new treatment.
      </SectionHeading>
      <div className="arc-guidance-grid">
        <div className="arc-guidance-column arc-guidance-column--do">
          <h3><Check aria-hidden="true" /> Do</h3>
          <ul>
            <li><strong>Start with content hierarchy.</strong><span>Set type, spacing, and reading order before adding a leaf or stamp.</span></li>
            <li><strong>Repeat the ruled details.</strong><span>Use the same purple outline and registration marks to unify distinct regions.</span></li>
            <li><strong>Give long language room.</strong><span>Let buttons and labels wrap; do not truncate essential instructions.</span></li>
            <li><strong>Use native behavior first.</strong><span>Preserve familiar input, select, range, and keyboard interactions.</span></li>
          </ul>
        </div>
        <div className="arc-guidance-column arc-guidance-column--dont">
          <h3><X aria-hidden="true" /> Avoid</h3>
          <ul>
            <li><strong>Stacking expressive surfaces.</strong><span>One botanical focal point is stronger than a page of competing gradients.</span></li>
            <li><strong>Magenta for small text.</strong><span>Use ink or aubergine for high-contrast copy on ivory.</span></li>
            <li><strong>Rounding every container.</strong><span><ProtectedText>Arc</ProtectedText> uses selective curves, not a universal soft-card vocabulary.</span></li>
            <li><strong>Motion as decoration.</strong><span>Transitions explain state; they do not loop or delay access.</span></li>
          </ul>
        </div>
      </div>
      <div className="arc-recipe">
        <div><p className="arc-eyebrow">IMPLEMENTATION / RECIPE</p><h3>Compose with Tokens, Not Sampled Colors.</h3><p>Start with semantic surfaces and readable ink. Add component state styles, then one authored accent. Keep <ProtectedText>Arc</ProtectedText> prefixed custom properties intact so foundations can evolve together.</p></div>
        <pre tabIndex={0}><code translate="no" className="notranslate">{`.example-panel {\n  color: var(--arc-ink);\n  background: var(--arc-paper-raised);\n  border: 1px solid var(--arc-rule-strong);\n  padding: var(--arc-space-6);\n  box-shadow: var(--arc-shadow-sm);\n}\n\n.example-panel:focus-visible {\n  outline: 3px solid var(--arc-focus);\n  outline-offset: 3px;\n}`}</code></pre>
      </div>
      <div className="arc-decision-list">
        <h3>A Quick Design Review</h3>
        <ol><li><span>{formatLedgerNumber(1)}</span>Can the task be understood with artwork removed?</li><li><span>{formatLedgerNumber(2)}</span>Is essential copy ink-dark and comfortably sized?</li><li><span>{formatLedgerNumber(3)}</span>Does every control respond to keyboard and touch?</li><li><span>{formatLedgerNumber(4)}</span>Are long labels, empty results, and errors designed?</li><li><span>{formatLedgerNumber(5)}</span>Does the composition remain calm at {formatUnit(320, 'pixels')} wide?</li></ol>
      </div>
    </section>
  );
}

export function AccessibilitySection() {
  return (
    <section id="accessibility" className="arc-section arc-accessibility" aria-labelledby="section-9">
      <SectionHeading number={9} eyebrow="Practice / accessibility" title="Access Is Part of the Impression.">
        <ProtectedText>Arc</ProtectedText>’s visual decisions and component behavior are developed together. Automated checks are a baseline; keyboard, zoom, and assistive-technology review remain essential.
      </SectionHeading>
      <div className="arc-accessibility-grid">
        <article><span className="arc-accessibility-grid__key">Aa</span><h3>Contrast with a Job to Do</h3><p>Ink and aubergine carry body text and actions on ivory. Muted copy remains dark enough for reading; saturated pigment is primarily decorative.</p><div className="arc-a11y-contrast"><span>INK / PAPER</span><strong>HIGH CONTRAST</strong></div></article>
        <article><span className="arc-accessibility-grid__key">↹</span><h3>A Visible Path</h3><p>Every interactive element has a focus-visible treatment. The skip link, tabs, dialog, pagination, and native controls remain keyboard operable.</p><span className="arc-focus-demo" tabIndex={0}>Focus Me with Tab</span></article>
        <article><span className="arc-accessibility-grid__key">〽</span><h3>Motion on Your Terms</h3><p>Prefers-reduced-motion removes proof animation and nonessential transitions. Status is never conveyed by motion alone.</p><code translate="no" className="notranslate">@media (prefers-reduced-motion: reduce)</code></article>
        <article><span className="arc-accessibility-grid__key">200%</span><h3>Room to Reflow</h3><p>Text can grow without rigid control heights. Tables scroll inside a named region, while cards and forms reflow rather than shrink.</p><div className="arc-zoom-demo"><span>Readable at every measure</span></div></article>
      </div>
      <div className="arc-a11y-checklist">
        <h3>Before Shipping an <ProtectedText>Arc</ProtectedText> Composition</h3>
        <ul><li><Check aria-hidden="true" />Complete every task with keyboard alone.</li><li><Check aria-hidden="true" />Check names, roles, states, and dialog focus with a screen reader.</li><li><Check aria-hidden="true" />Verify 200% text zoom and 400% browser zoom at a narrow viewport.</li><li><Check aria-hidden="true" />Test reduced motion, forced colors where supported, and touch targets.</li><li><Check aria-hidden="true" />Confirm error identification and recovery with real content.</li></ul>
      </div>
      <p className="arc-foundation-note">This showcase targets <ProtectedText>WCAG 2.2 AA</ProtectedText> practices. A design-system example cannot certify an implementation’s accessibility; test the final content and product context.</p>
    </section>
  );
}
