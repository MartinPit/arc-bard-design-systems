import { useState } from 'react';
import {
  Archive,
  Bookmark,
  Check,
  Copy,
  Download,
  FileText,
  Leaf,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
} from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { Specimen } from '../components/Specimen';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  IconButton,
  Pagination,
  Popover,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Table,
  Tabs,
  Textarea,
  TextInput,
  Toast,
  Tooltip,
} from '../components';

function ButtonSpecimen() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'saved' | 'preview' | 'details'>('idle');
  function save() {
    setStatus('loading');
    window.setTimeout(() => setStatus('saved'), 700);
  }
  return (
    <Specimen
      title="Button"
      description="Primary actions use aubergine ink. Secondary actions are ruled; quiet actions recede until needed. Loading preserves label context."
      code={`<Button onClick={save}>Save changes</Button>\n<Button variant="secondary">Preview</Button>\n<Button loading>Saving changes</Button>\n<Button disabled>Unavailable</Button>`}
    >
      <div className="arc-demo-stack">
        <div className="arc-demo-row">
          <Button onClick={save} loading={status === 'loading'}>
            {status === 'saved' ? <><Check size={16} aria-hidden="true" /> Saved</> : status === 'loading' ? 'Saving changes' : 'Save changes'}
          </Button>
          <Button variant="secondary" onClick={() => setStatus('preview')}>Preview</Button>
          <Button variant="quiet" onClick={() => setStatus('details')}>View details</Button>
          <Button disabled>Unavailable</Button>
        </div>
        <p className="arc-demo-note" aria-live="polite">{status === 'saved' ? 'Changes saved locally for this demonstration.' : status === 'preview' ? 'Preview selected. No content leaves this page.' : status === 'details' ? 'Details: local specimen, aubergine primary action.' : status === 'loading' ? 'Saving local demonstration changes…' : 'Try the save, preview, and details actions.'}</p>
        <Button variant="secondary" className="arc-demo-long-button">Continue with a deliberately longer action label</Button>
      </div>
    </Specimen>
  );
}

function IconButtonSpecimen() {
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [action, setAction] = useState('');
  return (
    <Specimen
      title="Icon Button"
      description="Compact actions always carry an accessible name. Use familiar Lucide symbols and a visible outline where the action needs more emphasis."
      code={`<IconButton label="Bookmark resource" aria-pressed={saved}>\n  <Bookmark aria-hidden="true" />\n</IconButton>\n<Tooltip label="Copy link">\n  <IconButton label="Copy link"><Copy /></IconButton>\n</Tooltip>`}
    >
      <div className="arc-demo-stack">
        <div className="arc-demo-row">
          <IconButton label={bookmarked ? 'Remove bookmark' : 'Bookmark resource'} aria-pressed={bookmarked} onClick={() => setBookmarked((value) => !value)}>
            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} aria-hidden="true" />
          </IconButton>
          <IconButton label={copied ? 'Copied' : 'Copy reference'} onClick={() => setCopied(true)}><Copy size={18} aria-hidden="true" /></IconButton>
          <IconButton label="Edit resource" variant="ink" onClick={() => setAction('Edit action selected.')}><Pencil size={18} aria-hidden="true" /></IconButton>
          <IconButton label="More actions" variant="quiet" onClick={() => setAction('Additional actions are represented by this local acknowledgement.')}><MoreHorizontal size={19} aria-hidden="true" /></IconButton>
          <IconButton label="Archive unavailable" disabled><Archive size={18} aria-hidden="true" /></IconButton>
        </div>
        <p className="arc-demo-note" aria-live="polite">{action || (bookmarked ? 'Resource bookmarked. ' : '') + (copied ? 'Reference copied for this demo.' : 'Select an icon action; disabled actions remain quiet.')}</p>
      </div>
    </Specimen>
  );
}

function TextInputSpecimen() {
  const [email, setEmail] = useState('reader@example.com');
  const [title, setTitle] = useState('Field notes');
  return (
    <Specimen
      title="Text Input"
      description="Persistent labels precede every field. Hints, errors, and success messages connect through aria-describedby; color never works alone."
      code={`<TextInput label="Email address" type="email" required\n  error={invalid ? 'Enter a complete email address.' : undefined} />\n<TextInput label="Resource title" value={title} success="Available" />`}
    >
      <div className="arc-form-grid">
        <TextInput label="Email address" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} hint="Used only for this local demonstration." error={email.length > 0 && !email.includes('@') ? 'Enter a complete email address.' : undefined} />
        <TextInput label="Resource title" value={title} onChange={(event) => setTitle(event.target.value)} success={title.length > 3 ? 'Title is available' : undefined} error={title.length <= 3 ? 'Use at least four characters.' : undefined} />
        <TextInput label="Reference (disabled)" value="ARC-019" disabled readOnly />
      </div>
    </Specimen>
  );
}

function TextareaSpecimen() {
  const [value, setValue] = useState('A clear summary helps readers decide whether the full resource is relevant.');
  return (
    <Specimen
      title="Textarea"
      description="Multi-line fields grow to fit reading and editing tasks. A live character count provides constraint feedback without interrupting composition."
      code={`<Textarea label="Summary" rows={4} maxLength={180}\n  value={value} onChange={(event) => setValue(event.target.value)}\n  hint={\`\${value.length}/180 characters\`} />`}
    >
      <Textarea label="Summary" rows={4} maxLength={180} value={value} onChange={(event) => setValue(event.target.value)} hint={`${value.length}/180 characters. Keep the central idea in the first sentence.`} />
    </Specimen>
  );
}

function SelectSpecimen() {
  const [value, setValue] = useState('published');
  return (
    <Specimen
      title="Select"
      description="The native select preserves platform keyboard and touch behavior. Use it for a single choice among five or more mutually exclusive options."
      code={`<Select label="Publication status" value={status} onChange={…}>\n  <option value="draft">Draft</option>\n  <option value="published">Published</option>\n  <option value="archived">Archived</option>\n</Select>`}
    >
      <div className="arc-form-grid arc-form-grid--two">
        <Select label="Publication status" value={value} onChange={(event) => setValue(event.target.value)} hint={`Current selection: ${value}`}>
          <option value="draft">Draft</option><option value="review">In review</option><option value="published">Published</option><option value="archived">Archived</option><option value="retired">Retired</option>
        </Select>
        <Select label="Unavailable selection" disabled value="locked" onChange={() => undefined}><option value="locked">Locked by permissions</option></Select>
      </div>
    </Specimen>
  );
}

function CheckboxSpecimen() {
  const [choices, setChoices] = useState({ notes: true, updates: false });
  return (
    <Specimen
      title="Checkbox"
      description="Checkboxes support independent choices. Descriptions explain consequences while the native input retains familiar keyboard behavior."
      code={`<Checkbox label="Include field notes"\n  description="Add supporting observations to the export."\n  checked={includeNotes} onChange={…} />`}
    >
      <div className="arc-demo-stack">
        <Checkbox label="Include field notes" description="Add supporting observations to the export." checked={choices.notes} onChange={(event) => setChoices({ ...choices, notes: event.target.checked })} />
        <Checkbox label="Include future updates" description="Opt in to occasional change notifications." checked={choices.updates} onChange={(event) => setChoices({ ...choices, updates: event.target.checked })} />
        <Checkbox label="Locked source material" description="This option is managed elsewhere." checked disabled onChange={() => undefined} />
      </div>
    </Specimen>
  );
}

function RadioGroupSpecimen() {
  const [cadence, setCadence] = useState('weekly');
  return (
    <Specimen
      title="Radio Group"
      description="A fieldset and legend give a mutually exclusive set one clear identity. Three to five visible options usually work better than a select."
      code={`<RadioGroup label="Digest cadence" name="cadence"\n  options={[{ value: 'weekly', label: 'Weekly' }, …]}\n  value={cadence} onChange={setCadence} />`}
    >
      <RadioGroup label="Digest cadence" name="cadence" value={cadence} onChange={setCadence} options={[
        { value: 'daily', label: 'Daily', description: 'A concise note each weekday.' },
        { value: 'weekly', label: 'Weekly', description: 'One considered summary every Monday.' },
        { value: 'monthly', label: 'Monthly', description: 'A longer review on the first of each month.' },
      ]} />
    </Specimen>
  );
}

function SwitchSpecimen() {
  const [enabled, setEnabled] = useState(true);
  return (
    <Specimen
      title="Switch"
      description="Switches apply an immediate binary setting. The track, position, and programmatic switch state all communicate whether it is on."
      code={`<Switch label="Revision notifications"\n  description="Notify me when a watched resource changes."\n  checked={enabled} onCheckedChange={setEnabled} />`}
    >
      <div className="arc-demo-stack">
        <Switch label="Revision notifications" description="Notify me when a watched resource changes." checked={enabled} onCheckedChange={setEnabled} />
        <p className="arc-inline-status" aria-live="polite"><span className={enabled ? 'is-on' : ''} />Notifications are {enabled ? 'on' : 'off'}.</p>
        <Switch label="Locked synchronization" description="This setting is unavailable." checked={false} disabled onCheckedChange={() => undefined} />
      </div>
    </Specimen>
  );
}

function SliderSpecimen() {
  const [density, setDensity] = useState(64);
  return (
    <Specimen
      title="Slider"
      description="A native range supports arrows, Page Up/Down, Home, and End. Pair the visual track with a readable numeric output."
      code={`<Slider label="Preview density" min={0} max={100} unit="%"\n  value={density} onChange={setDensity} />`}
    >
      <div className="arc-demo-stack">
        <Slider label="Preview density" min={0} max={100} unit="%" value={density} onChange={setDensity} />
        <p className="arc-demo-note">Density is {density}%. Adjust with a pointer or arrow keys.</p>
        <Slider label="Fixed density" value={30} unit="%" disabled onChange={() => undefined} />
      </div>
    </Specimen>
  );
}

function TabsSpecimen() {
  return (
    <Specimen
      title="Tabs"
      description="Tabs switch closely related peer views. Arrow keys move and select; Home and End jump to the boundaries."
      code={`<Tabs label="Resource details" items={[\n  { id: 'overview', label: 'Overview', content: <Overview /> },\n  { id: 'notes', label: 'Notes', content: <Notes /> },\n]} />`}
    >
      <Tabs label="Resource details" items={[
        { id: 'overview', label: 'Overview', content: <div className="arc-tab-copy"><h4>A concise overview</h4><p>Only the active panel lives in the reading flow. The selected tab is identified with both color and an underline.</p></div> },
        { id: 'notes', label: 'Field notes', content: <div className="arc-tab-copy"><h4>Observations in context</h4><p>Notes retain their relationship to the resource without adding another page to the navigation model.</p></div> },
        { id: 'history', label: 'History', content: <div className="arc-tab-copy"><h4>Revision history</h4><p>Three local revisions are available. The most recent clarified the summary language.</p></div> },
        { id: 'restricted', label: 'Restricted', disabled: true, content: null },
      ]} />
    </Specimen>
  );
}

function DialogSpecimen() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Editorial collection');
  return (
    <>
      <Specimen
        title="Dialog"
        description="A modal dialog traps focus, closes with Escape or its backdrop, and restores focus to the invoking control. It opens in a document portal."
        code={`<Dialog open={open} onOpenChange={setOpen}\n  title="Create a collection"\n  description="Add a short, recognizable name.">\n  <TextInput label="Collection name" />\n</Dialog>`}
      >
        <Button onClick={() => setOpen(true)}><Plus size={16} aria-hidden="true" /> Create a collection</Button>
        <p className="arc-demo-note">Test Tab, Shift + Tab, Escape, backdrop click, and focus return.</p>
      </Specimen>
      <Dialog open={open} onOpenChange={setOpen} title="Create a collection" description="This demonstration changes local state only. No information is sent." footer={<><Button variant="quiet" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Create collection</Button></>}>
        <TextInput label="Collection name" value={name} onChange={(event) => setName(event.target.value)} hint="Use a name that distinguishes this group from others." />
      </Dialog>
    </>
  );
}

function PopoverSpecimen() {
  const [compact, setCompact] = useState(false);
  return (
    <Specimen
      title="Popover"
      description="Non-modal detail appears near its trigger in a portal. Outside click and Escape dismiss it without blocking the rest of the page."
      code={`<Popover trigger={<><Settings2 /> Display options</>} label="Display options">\n  <Switch label="Compact rows" checked={compact} … />\n</Popover>`}
    >
      <Popover trigger={<><Settings2 size={16} aria-hidden="true" /> Display options</>} label="Display options">
        <p className="arc-eyebrow">LOCAL VIEW</p><h4 className="arc-popover__title">Display options</h4>
        <Switch label="Compact rows" description="Reduce vertical spacing in lists." checked={compact} onCheckedChange={setCompact} />
        <p className="arc-demo-note">{compact ? 'Compact rows selected.' : 'Comfortable rows selected.'}</p>
      </Popover>
    </Specimen>
  );
}

function TooltipSpecimen() {
  const [action, setAction] = useState('Hover or focus an icon button.');
  return (
    <Specimen
      title="Tooltip"
      description="Tooltips add a short label on hover or keyboard focus. They never contain required information or interactive content."
      code={`<Tooltip label="Download a local copy">\n  <IconButton label="Download resource">\n    <Download aria-hidden="true" />\n  </IconButton>\n</Tooltip>`}
    >
      <div className="arc-demo-row">
        <Tooltip label="Download a local copy"><IconButton label="Download resource" onClick={() => setAction('Download action activated.')}><Download size={18} aria-hidden="true" /></IconButton></Tooltip>
        <Tooltip label="Search this collection"><IconButton label="Search collection" onClick={() => setAction('Search action activated.')}><Search size={18} aria-hidden="true" /></IconButton></Tooltip>
        <span className="arc-demo-note" aria-live="polite">{action}</span>
      </div>
    </Specimen>
  );
}

interface DemoToast { id: number; title: string; message: string; tone: 'success' | 'info' | 'danger' }
function ToastSpecimen() {
  const [toasts, setToasts] = useState<DemoToast[]>([]);
  const [nextId, setNextId] = useState(1);
  function notify(tone: DemoToast['tone']) {
    const copy = tone === 'success'
      ? { title: 'Changes preserved', message: 'Your local edits are ready to review.' }
      : { title: 'Review recommended', message: 'One field still needs your attention.' };
    setToasts((items) => [...items.slice(-1), { id: nextId, tone, ...copy }]);
    setNextId((id) => id + 1);
  }
  return (
    <>
      <Specimen title="Toast" description="Brief status messages appear above the page without stealing focus. Every toast has an explicit dismiss action and an appropriate live-region role." code={`<Toast tone="success" title="Changes preserved"\n  message="Your local edits are ready to review."\n  onDismiss={() => remove(id)} />`}>
        <div className="arc-demo-row"><Button onClick={() => notify('success')}>Show success toast</Button><Button variant="secondary" onClick={() => notify('danger')}>Show review toast</Button></div>
        <p className="arc-demo-note">Toasts remain until dismissed, so their content cannot disappear before it is read.</p>
      </Specimen>
      {toasts.map((toast, index) => <Toast key={toast.id} {...toast} index={index} onDismiss={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} />)}
    </>
  );
}

function BadgeSpecimen() {
  return (
    <Specimen title="Badge" description="Badges classify compact status or metadata. Strong foregrounds meet their tinted grounds; labels stay short and literal." code={`<Badge>Reference</Badge>\n<Badge tone="accent">New edition</Badge>\n<Badge tone="success">Verified</Badge>`}>
      <div className="arc-demo-stack"><div className="arc-demo-row"><Badge>Reference</Badge><Badge tone="accent">New edition</Badge><Badge tone="success"><Check size={12} aria-hidden="true" /> Verified</Badge><Badge tone="danger">Needs review</Badge><Badge tone="info">In progress</Badge></div><Badge tone="neutral">Extended classification remains readable</Badge></div>
    </Specimen>
  );
}

function AvatarSpecimen() {
  return (
    <Specimen title="Avatar" description="Initial-based avatars avoid external images while retaining a useful accessible name. Three sizes support dense lists through featured bylines." code={`<Avatar name="Ada Lovelace" size="small" />\n<Avatar name="Grace Hopper" marked />\n<Avatar name="Katherine Johnson" size="large" />`}>
      <div className="arc-avatar-demo"><Avatar name="Ada Lovelace" size="small" /><Avatar name="Grace Hopper" marked /><Avatar name="Katherine Johnson" size="large" /><div><strong>Katherine Johnson</strong><p>Large avatar with a two-line byline</p></div></div>
    </Specimen>
  );
}

function CardSpecimen() {
  const [notesVisible, setNotesVisible] = useState(false);
  return (
    <Specimen title="Card" description="Cards group one coherent subject. A crisp rule and restrained offset create depth; an optional botanical accent distinguishes a featured item." code={`<Card eyebrow="FIELD GUIDE / 04" title="A considered summary"\n  footer={<Button variant="quiet">Read notes</Button>}>\n  <p>Related content with one clear destination.</p>\n</Card>`}>
      <div className="arc-card-demo-grid"><Card eyebrow="FIELD GUIDE / 04" title="A considered summary" footer={<Button variant="quiet" aria-expanded={notesVisible} onClick={() => setNotesVisible((value) => !value)}>{notesVisible ? 'Hide notes' : 'Read notes'} <FileText size={15} aria-hidden="true" /></Button>}><p>Keep one subject and one primary destination within each card.</p>{notesVisible && <p className="arc-demo-note">Notes: retain a concise summary and avoid competing destinations.</p>}</Card><Card accent eyebrow="FEATURED / 07" title="A little more expression" footer={<Badge tone="accent">Featured</Badge>}><p>The curved accent is decorative, leaving the reading order unchanged.</p></Card></div>
    </Specimen>
  );
}

const resourceRows = [
  { resource: <span className="arc-resource-cell"><Leaf size={15} aria-hidden="true" /> Botanical index</span>, kind: 'Reference', status: <Badge tone="success">Current</Badge>, revised: '12 Nov 2026', entries: '128' },
  { resource: <span className="arc-resource-cell"><FileText size={15} aria-hidden="true" /> Editorial methods</span>, kind: 'Guide', status: <Badge tone="info">In review</Badge>, revised: '08 Nov 2026', entries: '42' },
  { resource: <span className="arc-resource-cell"><Mail size={15} aria-hidden="true" /> Correspondence patterns</span>, kind: 'Collection', status: <Badge>Draft</Badge>, revised: '01 Nov 2026', entries: '86' },
];
function TableSpecimen() {
  const [empty, setEmpty] = useState(false);
  return (
    <Specimen title="Table" description="Semantic headers, a useful caption, and numeric alignment make comparison easy. Small screens expose a labeled horizontal scroll region." code={`<Table caption="Resource register"\n  columns={[{ key: 'resource', label: 'Resource' }, …]}\n  rows={rows} emptyMessage="No matching resources." />`}>
      <div className="arc-demo-stack"><Table caption="Resource register" columns={[{ key: 'resource', label: 'Resource' }, { key: 'kind', label: 'Format' }, { key: 'status', label: 'Status' }, { key: 'revised', label: 'Revised' }, { key: 'entries', label: 'Entries', numeric: true }]} rows={empty ? [] : resourceRows} emptyMessage="No resources match this view. Reset the example to restore them." /><Button variant="quiet" onClick={() => setEmpty((value) => !value)}>{empty ? 'Restore rows' : 'Preview empty state'}</Button></div>
    </Specimen>
  );
}

function PaginationSpecimen() {
  const [page, setPage] = useState(3);
  return (
    <Specimen title="Pagination" description="Ellipses keep long ranges compact while first, last, and adjacent pages remain available. Current, previous, and next states are explicit." code={`<Pagination currentPage={page} totalPages={8}\n  onPageChange={setPage} />`}>
      <div className="arc-demo-stack"><Pagination currentPage={page} totalPages={8} onPageChange={setPage} /><p className="arc-demo-note" aria-live="polite">Page {page} of 8. Select a page or use the arrow buttons.</p></div>
    </Specimen>
  );
}

export function ComponentsSection() {
  return (
    <section id="components" className="arc-section arc-components" aria-labelledby="section-06">
      <SectionHeading number="06" eyebrow="System / components" title="Nineteen instruments, one register.">
        Each specimen is live, local, and built with semantic HTML. Expand its source for a concise React implementation reference.
      </SectionHeading>
      <div className="arc-component-index" aria-label="Component index">
        {['Button', 'Icon Button', 'Text Input', 'Textarea', 'Select', 'Checkbox', 'Radio Group', 'Switch', 'Slider', 'Tabs', 'Dialog', 'Popover', 'Tooltip', 'Toast', 'Badge', 'Avatar', 'Card', 'Table', 'Pagination'].map((item, index) => <a key={item} href={`#specimen-${item.toLowerCase().replaceAll(' ', '-')}`}><span>{String(index + 1).padStart(2, '0')}</span>{item}</a>)}
      </div>
      <div className="arc-specimens">
        <div id="specimen-button"><ButtonSpecimen /></div>
        <div id="specimen-icon-button"><IconButtonSpecimen /></div>
        <div id="specimen-text-input"><TextInputSpecimen /></div>
        <div id="specimen-textarea"><TextareaSpecimen /></div>
        <div id="specimen-select"><SelectSpecimen /></div>
        <div id="specimen-checkbox"><CheckboxSpecimen /></div>
        <div id="specimen-radio-group"><RadioGroupSpecimen /></div>
        <div id="specimen-switch"><SwitchSpecimen /></div>
        <div id="specimen-slider"><SliderSpecimen /></div>
        <div id="specimen-tabs"><TabsSpecimen /></div>
        <div id="specimen-dialog"><DialogSpecimen /></div>
        <div id="specimen-popover"><PopoverSpecimen /></div>
        <div id="specimen-tooltip"><TooltipSpecimen /></div>
        <div id="specimen-toast"><ToastSpecimen /></div>
        <div id="specimen-badge"><BadgeSpecimen /></div>
        <div id="specimen-avatar"><AvatarSpecimen /></div>
        <div id="specimen-card"><CardSpecimen /></div>
        <div id="specimen-table"><TableSpecimen /></div>
        <div id="specimen-pagination"><PaginationSpecimen /></div>
      </div>
    </section>
  );
}
