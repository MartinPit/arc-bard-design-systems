import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Bell, BellOff, Bookmark, Check, Search, Star } from 'lucide-react';
import { Button, IconButton, TextInput, Textarea, SelectField, CheckboxField, RadioGroupField, SwitchField, SliderField, Tabs, Dialog, Popover, Tooltip, Toast, Badge, Avatar, Card, Table, Pagination, type ToastMessage } from '../components/Primitives';
import { Reveal, SectionHeader, Specimen } from '../components/Specimen';

function ButtonDemo() {
  const [loading, setLoading] = useState(false);
  function prepare() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1400);
  }
  return <div className="bard-demo-stack"><div className="bard-demo-row"><Button>Compose</Button><Button variant="secondary">Save a draft</Button><Button variant="quiet">View details <ArrowUpRight size={15} /></Button></div><div className="bard-demo-row"><Button loading={loading} onClick={prepare}>{loading ? 'Preparing' : 'Preview loading'}</Button><Button disabled>Unavailable</Button><Button variant="secondary" className="bard-long-label">A deliberately generous label that wraps gracefully</Button></div></div>;
}

function IconButtonDemo() {
  const [favorite, setFavorite] = useState(false);
  const [notices, setNotices] = useState(true);
  return <div className="bard-demo-row bard-demo-row--center"><IconButton label={favorite ? 'Remove from favorites' : 'Add to favorites'} pressed={favorite} onClick={() => setFavorite(!favorite)}><Star size={19} fill={favorite ? 'currentColor' : 'none'} /></IconButton><IconButton label={notices ? 'Mute notifications' : 'Enable notifications'} pressed={!notices} onClick={() => setNotices(!notices)}>{notices ? <Bell size={19} /> : <BellOff size={19} />}</IconButton><IconButton label="Unavailable action" disabled><Bookmark size={19} /></IconButton><span className="bard-demo-note">State is communicated by label as well as shape.</span></div>;
}

function TextInputDemo() {
  const [email, setEmail] = useState('reader@example.com');
  const invalid = email.length > 0 && !email.includes('@');
  return <div className="bard-demo-form"><TextInput label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={invalid ? 'Include an @ sign, for example name@example.com.' : undefined} hint={invalid ? undefined : 'Used only for this local demonstration.'} /><TextInput label="Reference number" value="BRD–024" disabled hint="Disabled values remain visible but are not submitted." /></div>;
}

function TextareaDemo() {
  const [note, setNote] = useState('A fine line can hold an entire composition together.');
  return <Textarea label="Design note" value={note} maxLength={120} onChange={(event) => setNote(event.target.value)} hint={`${note.length} of 120 characters. Keep the note useful on its own.`} />;
}

function SelectDemo() {
  const [value, setValue] = useState('mint');
  return <SelectField label="Surface treatment" value={value} onChange={setValue} options={[{ value: 'mint', label: 'Pale mint — quiet and grounded' }, { value: 'aqua', label: 'Still aqua — cool and spacious' }, { value: 'lilac', label: 'Iris lilac — expressive and soft' }]} hint="Native selection preserves device and keyboard behavior." />;
}

function CheckboxDemo() {
  const [choices, setChoices] = useState({ review: true, updates: false });
  return <div className="bard-demo-stack"><CheckboxField label="Include the accessibility review" checked={choices.review} onCheckedChange={(review) => setChoices({ ...choices, review })} /><CheckboxField label="Send occasional research updates with a label long enough to test comfortable wrapping" checked={choices.updates} onCheckedChange={(updates) => setChoices({ ...choices, updates })} /><CheckboxField label="Archived decision (disabled)" checked={false} onCheckedChange={() => {}} disabled /></div>;
}

function RadioGroupDemo() {
  const [value, setValue] = useState('balanced');
  return <RadioGroupField label="Interface density" value={value} onChange={setValue} options={[{ value: 'spacious', label: 'Spacious', description: 'More air between independent ideas' }, { value: 'balanced', label: 'Balanced', description: 'The default reading rhythm' }, { value: 'compact', label: 'Compact', description: 'For repeated, data-dense views' }]} />;
}

function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);
  return <div className="bard-demo-stack"><SwitchField label="Ambient linework" description="Slow decorative movement; disabled by reduced-motion preferences." checked={enabled} onCheckedChange={setEnabled} /><SwitchField label="Locked setting" description="A disabled setting explains why it cannot change." checked={false} onCheckedChange={() => {}} disabled /></div>;
}

function SliderDemo() {
  const [value, setValue] = useState(64);
  return <SliderField label="Pattern visibility" value={value} onValueChange={setValue} />;
}

function TabsDemo() {
  return <Tabs items={[{ value: 'intent', label: 'Intent', content: <p>Start with the reason a surface exists. A clear intention makes color, hierarchy, and copy easier to resolve.</p> }, { value: 'anatomy', label: 'Anatomy', content: <p>A fine rule separates the heading from the content. Generous inset spacing makes that separation felt before it is noticed.</p> }, { value: 'tokens', label: 'Tokens', content: <div className="bard-inline-code"><code>--bard-space-6: 2rem</code><code>--bard-radius-lg: 1.75rem</code></div> }]} />;
}

function ToastDemo() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  function showToast() {
    const id = Date.now();
    setToasts((current) => [...current, { id, title: 'Changes preserved', message: 'Your preferences are saved on this device.' }]);
  }
  return <><Button variant="secondary" onClick={showToast}>Show confirmation</Button>{createPortal(<div className="bard-toast-region" aria-live="polite" aria-relevant="additions removals">{toasts.map((toast) => <Toast key={toast.id} toast={toast} onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))} />)}</div>, document.body)}</>;
}

function BadgeDemo() {
  return <div className="bard-demo-stack"><div className="bard-demo-row"><Badge>Stable</Badge><Badge tone="success">Approved</Badge><Badge tone="warning">Needs review</Badge><Badge tone="lilac">Expressive</Badge></div><p className="bard-demo-note"><Check size={14} aria-hidden="true" /> Text carries the status; the dot and tint are secondary.</p></div>;
}

function AvatarDemo() {
  return <div className="bard-demo-stack"><div className="bard-avatar-group"><Avatar initials="AM" label="Ari Morgan, available" status /><Avatar initials="SK" label="Sora Kim" tone="lilac" /><Avatar initials="JT" label="Jules Taylor" tone="aqua" /></div><div className="bard-person"><Avatar initials="AM" label="Ari Morgan" tone="mint" /><div><strong>Ari Morgan</strong><span>Design systems · Contributor</span></div></div></div>;
}

function CardDemo() {
  const [saved, setSaved] = useState(false);
  return <Card eyebrow="Reference · 06" title="The intelligent use of ornament" footer={<><span>8 min read</span><IconButton label={saved ? 'Remove bookmark' : 'Bookmark reference'} pressed={saved} onClick={() => setSaved(!saved)}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></IconButton></>}><p>Decoration earns its place when it reveals origin, structure, or emphasis. Begin with purpose; let necessity edit the detail.</p><div className="bard-card__meta"><Badge tone="lilac">Perspective</Badge><span>Updated this week</span></div></Card>;
}

const resourceRows = [
  ['Foundation', 'Color', 'Core'],
  ['Foundation', 'Typography', 'Core'],
  ['Component', 'Dialog', 'Reviewed'],
  ['Component', 'Text Input', 'Reviewed'],
];

function TableDemo() {
  const [query, setQuery] = useState('');
  const filtered = resourceRows.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase()));
  return <div className="bard-table-demo"><TextInput label="Filter resources" type="search" placeholder="Try “dialog” or “type”" value={query} onChange={(event) => setQuery(event.target.value)} />{filtered.length ? <Table caption="Design-system resources" headers={['Group', 'Resource', 'Status']} rows={filtered.map((row) => [row[0], row[1], <Badge key={row.join('')} tone={row[2] === 'Core' ? 'neutral' : 'success'}>{row[2]}</Badge>])} /> : <div className="bard-empty" role="status"><Search size={24} aria-hidden="true" /><strong>No resources match “{query}”</strong><p>Try a broader term or clear the filter.</p><Button variant="quiet" onClick={() => setQuery('')}>Clear filter</Button></div>}</div>;
}

const pages = [
  ['Color roles', 'Type scale', 'Spacing units', 'Shape language'],
  ['Button anatomy', 'Field guidance', 'Overlay behavior', 'Status patterns'],
  ['Motion tokens', 'Content voice', 'Review checklist', 'Release notes'],
];

function PaginationDemo() {
  const [page, setPage] = useState(1);
  return <div className="bard-pagination-demo"><div className="bard-resource-page" aria-live="polite"><p className="bard-eyebrow">Chapter {String(page).padStart(2, '0')}</p><ul>{pages[page - 1].map((item) => <li key={item}>{item}<ArrowUpRight size={14} aria-hidden="true" /></li>)}</ul></div><Pagination page={page} pageCount={3} onPageChange={setPage} /></div>;
}

export function ComponentCatalog() {
  return (
    <section id="components" className="bard-section bard-section--components" aria-labelledby="components-title">
      <Reveal><SectionHeader number="06" eyebrow="Component library" title="Nineteen instruments, one temperament." description="Every example is interactive and locally owned. Familiar semantics come first; Bard’s fine rules, curved silhouettes, and tidal color provide the accent." /></Reveal>
      <div className="bard-specimen-grid">
        <Reveal><Specimen title="Button" description="Clear hierarchy, observable progress, and generous target areas." code={`<Button>Compose</Button>\n<Button variant="secondary">Save a draft</Button>\n<Button loading>Preparing</Button>`}><ButtonDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Icon Button" description="Compact actions with persistent accessible names and pressed states." code={`<IconButton label="Add to favorites" pressed={favorite}>\n  <Star aria-hidden="true" />\n</IconButton>`}><IconButtonDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Text Input" description="Persistent labels, specific errors, and readable disabled values." code={`<TextInput\n  label="Email address"\n  type="email"\n  error="Include an @ sign."\n/>`}><TextInputDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Textarea" description="Room for longer responses, with a nearby and useful constraint." code={`<Textarea\n  label="Design note"\n  maxLength={120}\n  hint="Keep the note useful on its own."\n/>`}><TextareaDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Select" description="A native menu with a composed visual frame and device-native options." code={`<SelectField\n  label="Surface treatment"\n  options={surfaces}\n  value={surface}\n  onChange={setSurface}\n/>`}><SelectDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Checkbox" description="Independent choices with resilient labels and obvious focus." code={`<CheckboxField\n  label="Include the accessibility review"\n  checked={review}\n  onCheckedChange={setReview}\n/>`}><CheckboxDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Radio Group" description="One choice from a complete, mutually exclusive set." code={`<RadioGroupField\n  label="Interface density"\n  options={densities}\n  value={density}\n  onChange={setDensity}\n/>`}><RadioGroupDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Switch" description="Immediate settings with text that remains available beside the control." code={`<SwitchField\n  label="Ambient linework"\n  description="Slow decorative movement."\n  checked={enabled}\n  onCheckedChange={setEnabled}\n/>`}><SwitchDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Slider" description="Continuous adjustment with a visible value and native keyboard steps." code={`<SliderField\n  label="Pattern visibility"\n  value={visibility}\n  onValueChange={setVisibility}\n/>`}><SliderDemo /></Specimen></Reveal>
        <Reveal wide><Specimen title="Tabs" description="Related views within one context, with an animated active-line indicator." wide code={`<Tabs items={[\n  { value: 'intent', label: 'Intent', content: <Intent /> },\n  { value: 'anatomy', label: 'Anatomy', content: <Anatomy /> },\n]} />`}><TabsDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Dialog" description="A focused interruption with focus containment, Escape support, and return focus." code={`<Dialog.Root open={open} onOpenChange={setOpen}>\n  <Dialog.Trigger>Open dialog</Dialog.Trigger>\n  <Dialog.Portal>\n    <Dialog.Backdrop />\n    <Dialog.Popup>\n      <Dialog.Title>One clear decision</Dialog.Title>\n    </Dialog.Popup>\n  </Dialog.Portal>\n</Dialog.Root>`}><Dialog /></Specimen></Reveal>
        <Reveal><Specimen title="Popover" description="Non-modal context that stays close to its point of origin." code={`<Popover.Root>\n  <Popover.Trigger>About this surface</Popover.Trigger>\n  <Popover.Portal>\n    <Popover.Positioner>\n      <Popover.Popup>Supplemental context.</Popover.Popup>\n    </Popover.Positioner>\n  </Popover.Portal>\n</Popover.Root>`}><Popover /></Specimen></Reveal>
        <Reveal><Specimen title="Tooltip" description="Brief clarification for a labelled control, never essential instruction." code={`<Tooltip.Root>\n  <Tooltip.Trigger aria-label="More information">\n    <Info />\n  </Tooltip.Trigger>\n  <Tooltip.Portal>\n    <Tooltip.Positioner>\n      <Tooltip.Popup>Clarify, never conceal.</Tooltip.Popup>\n    </Tooltip.Positioner>\n  </Tooltip.Portal>\n</Tooltip.Root>`}><div className="bard-tooltip-demo"><Tooltip /><span>Focus or hover for a short note.</span></div></Specimen></Reveal>
        <Reveal><Specimen title="Toast" description="A polite, dismissible confirmation that does not take focus." code={`<Toast\n  toast={{ id: 1, title: 'Changes preserved', message: 'Saved locally.' }}\n  onDismiss={removeToast}\n/>`}><ToastDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Badge" description="Short status language, with meaning carried by words rather than color." code={`<Badge>Stable</Badge>\n<Badge tone="success">Approved</Badge>\n<Badge tone="warning">Needs review</Badge>`}><BadgeDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Avatar" description="A composed identity marker with an explicit accessible label." code={`<Avatar\n  initials="AM"\n  label="Ari Morgan, available"\n  status\n/>`}><AvatarDemo /></Specimen></Reveal>
        <Reveal><Specimen title="Card" description="A discrete idea with consistent internal rhythm and one clear action." code={`<Card\n  eyebrow="Reference · 06"\n  title="The intelligent use of ornament"\n  footer={<BookmarkAction />}\n>\n  <p>Decoration begins with purpose.</p>\n</Card>`}><CardDemo /></Specimen></Reveal>
        <Reveal wide><Specimen wide title="Table" description="Semantic rows and columns in a labelled, keyboard-scrollable region." code={`<div role="region" tabIndex={0} aria-label="Resources, scrollable table">\n  <table>\n    <caption>Design-system resources</caption>\n    <thead>…</thead>\n    <tbody>…</tbody>\n  </table>\n</div>`}><TableDemo /></Specimen></Reveal>
        <Reveal wide><Specimen wide title="Pagination" description="Direct page access, current-page semantics, and honest boundaries." code={`<Pagination\n  page={page}\n  pageCount={3}\n  onPageChange={setPage}\n/>`}><PaginationDemo /></Specimen></Reveal>
      </div>
    </section>
  );
}
