import { useState, type ReactNode } from 'react';
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
import { ProtectedText } from '../components/ProtectedText';
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
  ToastRegion,
  Tooltip,
} from '../components';
import { useShowcaseUrlState } from '../showcaseUrlState';
import { formatDate, formatLedgerNumber, formatNumber, formatUnit } from '../intl';

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
      code={`<Button onClick={save}>Save Changes</Button>\n<Button variant="secondary">Preview Specimen</Button>\n<Button loading>Saving Changes…</Button>\n<Button disabled>Unavailable</Button>`}
    >
      <div className="arc-demo-stack">
        <div className="arc-demo-row">
          <Button onClick={save} loading={status === 'loading'}>
            {status === 'saved' ? <><Check size={16} aria-hidden="true" /> Changes Saved</> : status === 'loading' ? 'Saving Changes…' : 'Save Changes'}
          </Button>
          <Button variant="secondary" onClick={() => setStatus('preview')}>Preview Specimen</Button>
          <Button variant="quiet" onClick={() => setStatus('details')}>View Specimen Details</Button>
          <Button disabled>Unavailable</Button>
        </div>
        <p className="arc-demo-note" aria-live="polite">{status === 'saved' ? 'You saved changes locally for this demonstration.' : status === 'preview' ? 'You selected the specimen preview. No content leaves this page.' : status === 'details' ? 'Specimen details: local content and an aubergine primary action.' : status === 'loading' ? 'Saving local demonstration changes…' : 'Try the save, preview, and details actions.'}</p>
        <Button variant="secondary" className="arc-demo-long-button">Continue with a Deliberately Longer Action Label</Button>
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
      code={`<IconButton label="Bookmark Resource" aria-pressed={saved}>\n  <Bookmark aria-hidden="true" />\n</IconButton>\n<Tooltip label="Copy Link">\n  <IconButton label="Copy Link"><Copy /></IconButton>\n</Tooltip>`}
    >
      <div className="arc-demo-stack">
        <div className="arc-demo-row">
          <IconButton label={bookmarked ? 'Remove Bookmark' : 'Bookmark Resource'} aria-pressed={bookmarked} onClick={() => setBookmarked((value) => !value)}>
            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} aria-hidden="true" />
          </IconButton>
          <IconButton label={copied ? 'Copied' : 'Copy Reference'} onClick={() => setCopied(true)}><Copy size={18} aria-hidden="true" /></IconButton>
          <IconButton label="Edit Resource" variant="ink" onClick={() => setAction('You selected Edit Resource.')}><Pencil size={18} aria-hidden="true" /></IconButton>
          <IconButton label="More Resource Actions" variant="quiet" onClick={() => setAction('You selected additional resource actions.')}><MoreHorizontal size={19} aria-hidden="true" /></IconButton>
          <IconButton label="Archive Unavailable" disabled><Archive size={18} aria-hidden="true" /></IconButton>
        </div>
        <p className="arc-demo-note" aria-live="polite">{action || (bookmarked ? 'You bookmarked this resource. ' : '') + (copied ? 'You copied the reference for this demo.' : 'Select an icon action; disabled actions remain quiet.')}</p>
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
      code={`<TextInput label="Email address" name="email" autoComplete="off"\n  type="email" spellCheck={false} required value={email} onChange={(event) => setEmail(event.target.value)}\n  error={invalid ? 'Enter a complete email address.' : undefined} />\n<TextInput label="Resource title" name="resource-title" autoComplete="off"\n  value={title} onChange={(event) => setTitle(event.target.value)} success="Available" />`}
    >
      <div className="arc-form-grid">
        <TextInput label="Email address" name="email" autoComplete="off" type="email" spellCheck={false} required value={email} onChange={(event) => setEmail(event.target.value)} hint="Keep this address local to the demonstration." error={email.length > 0 && !email.includes('@') ? 'Enter a complete email address.' : undefined} />
        <TextInput label="Resource title" name="resource-title" autoComplete="off" value={title} onChange={(event) => setTitle(event.target.value)} success={title.length > 3 ? 'Title is available' : undefined} error={title.length <= 3 ? 'Use at least 4 characters.' : undefined} />
        <TextInput label="Reference (disabled)" name="resource-reference" autoComplete="off" value="ARC-019" translate="no" disabled readOnly />
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
      code={`<Textarea label="Summary" name="resource-summary" autoComplete="off"\n  rows={4} maxLength={180} value={value} onChange={(event) => setValue(event.target.value)}\n  hint={\`\${formatNumber(value.length)}/\${formatNumber(180)} characters\`} />`}
    >
      <Textarea label="Summary" name="resource-summary" autoComplete="off" rows={4} maxLength={180} value={value} onChange={(event) => setValue(event.target.value)} hint={`${formatNumber(value.length)}/${formatNumber(180)} characters. Keep the central idea in the first sentence.`} />
    </Specimen>
  );
}

function SelectSpecimen() {
  const [value, setValue] = useState('published');
  return (
    <Specimen
      title="Select"
      description="The native select preserves platform keyboard and touch behavior. Use it for a single choice among 5 or more mutually exclusive options."
      code={`<Select label="Publication status" name="publication-status" autoComplete="off"\n  value={status} onChange={…}>\n  <option value="draft">Draft</option>\n  <option value="published">Published</option>\n  <option value="archived">Archived</option>\n</Select>`}
    >
      <div className="arc-form-grid arc-form-grid--two">
        <Select label="Publication status" name="publication-status" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} hint={`Current selection: ${value}`}>
          <option value="draft">Draft</option><option value="review">In review</option><option value="published">Published</option><option value="archived">Archived</option><option value="retired">Retired</option>
        </Select>
        <Select label="Unavailable selection" name="unavailable-selection" autoComplete="off" disabled value="locked" onChange={() => undefined}><option value="locked">Locked by permissions</option></Select>
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
        <Checkbox label="Locked source material" description="Manage this option in your workspace settings." checked disabled onChange={() => undefined} />
      </div>
    </Specimen>
  );
}

function RadioGroupSpecimen() {
  const [cadence, setCadence] = useState('weekly');
  return (
    <Specimen
      title="Radio Group"
      description="A fieldset and legend give a mutually exclusive set 1 clear identity. 3 to 5 visible options usually work better than a select."
      code={`<RadioGroup label="Digest cadence" name="cadence"\n  options={[{ value: 'weekly', label: 'Weekly' }, …]}\n  value={cadence} onChange={setCadence} />`}
    >
      <RadioGroup label="Digest cadence" name="cadence" value={cadence} onChange={setCadence} options={[
        { value: 'daily', label: 'Daily', description: 'A concise note each weekday.' },
        { value: 'weekly', label: 'Weekly', description: `${formatNumber(1)} considered summary every Monday.` },
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
      code={`<Switch label="Revision notifications"\n  description="Get notified when a watched resource changes."\n  checked={enabled} onCheckedChange={setEnabled} />`}
    >
      <div className="arc-demo-stack">
        <Switch label="Revision notifications" description="Get notified when a watched resource changes." checked={enabled} onCheckedChange={setEnabled} />
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
      description="A native range supports arrows, Page Up/Page Down, Home, and End. Pair the visual track with a readable numeric output."
      code={`<Slider label="Preview density" min={0} max={100} unit="%"\n  value={density} onChange={setDensity} />\n<p>Density is {formatUnit(density, '%')}. Adjust with a pointer or arrow keys.</p>`}
    >
      <div className="arc-demo-stack">
        <Slider label="Preview density" min={0} max={100} unit="%" value={density} onChange={setDensity} />
        <p className="arc-demo-note">Density is {formatUnit(density, '%')}. Adjust with a pointer or arrow keys.</p>
        <Slider label="Fixed density" value={30} unit="%" disabled onChange={() => undefined} />
      </div>
    </Specimen>
  );
}

function TabsSpecimen() {
  const { tab, setTab } = useShowcaseUrlState();
  return (
    <Specimen
      title="Tabs"
      description="Tabs switch closely related peer views. Arrow keys move and select; Home and End jump to the boundaries."
      code={`const { tab, setTab } = useShowcaseUrlState();\n<Tabs label="Resource details" value={tab} onValueChange={setTab} items={[\n  { id: 'overview', label: 'Overview', content: <Overview /> },\n  { id: 'notes', label: 'Notes', content: <Notes /> },\n]} />`}
    >
      <Tabs label="Resource details" value={tab} onValueChange={setTab} items={[
        { id: 'overview', label: 'Overview', content: <div className="arc-tab-copy"><h4>A Concise Overview</h4><p>Only the active panel lives in the reading flow. Color and an underline show which tab you selected.</p></div> },
        { id: 'notes', label: 'Field Notes', content: <div className="arc-tab-copy"><h4>Observations in Context</h4><p>Notes retain their relationship to the resource without adding another page to the navigation model.</p></div> },
        { id: 'history', label: 'History', content: <div className="arc-tab-copy"><h4>Revision History</h4><p>{formatNumber(3)} local revisions are available. The most recent clarified the summary language.</p></div> },
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
        code={`<Dialog open={open} onOpenChange={setOpen}\n  title="Create a Collection"\n  description="Add a short, recognizable name.">\n  <TextInput label="Collection name" name="collection-name" autoComplete="off" />\n</Dialog>`}
      >
        <Button onClick={() => setOpen(true)}><Plus size={16} aria-hidden="true" /> Create a Collection</Button>
        <p className="arc-demo-note">Test Tab, Shift + Tab, Escape, backdrop click, and focus return.</p>
      </Specimen>
      <Dialog open={open} onOpenChange={setOpen} title="Create a Collection" description="This demonstration changes local state only. You keep all information on this device." footer={<><Button variant="quiet" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Create Collection</Button></>}>
        <TextInput label="Collection name" name="collection-name" autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} hint="Use a name that distinguishes this group from others." />
        <div className="arc-dialog__example-copy">
          <p>Group essays, field guides, and correspondence around one question. A collection can begin with a single useful reference and grow as the reading continues.</p>
          <p>Long descriptions remain in the readable column. Scrolling stays inside this focused panel, including when the available space is reduced by a mobile display’s safe areas.</p>
          <p>Keep the name specific enough to recognize later, without turning the title into a complete catalogue description.</p>
          <p className="arc-demo-note">Reference <ProtectedText>ARC-COLLECTION-WITH-A-DELIBERATELY-LONG-AND-UNBROKEN-CATALOGUE-IDENTIFIER-7F42C9A88D1E6B20</ProtectedText>.</p>
        </div>
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
      code={`<Popover trigger={<><Settings2 /> Display Options</>} label="Display Options">\n  <Switch label="Compact rows" checked={compact} … />\n</Popover>`}
    >
      <Popover trigger={<><Settings2 size={16} aria-hidden="true" /> Display Options</>} label="Display Options">
        <p className="arc-eyebrow">LOCAL VIEW</p><h4 className="arc-popover__title">Display Options</h4>
        <Switch label="Compact rows" description="Reduce vertical spacing in lists." checked={compact} onCheckedChange={setCompact} />
        <p className="arc-demo-note">{compact ? 'Compact rows selected.' : 'Comfortable rows selected.'}</p>
        <div className="arc-popover__guidance">
          <p><strong>Reading Rhythm</strong></p>
          <p>Comfortable rows leave room for titles, annotations, and the small details that make a collection easier to scan.</p>
          <p>Compact rows are useful when a familiar collection needs more entries visible at once. The setting changes density, not reading order.</p>
          <p>Long panels scroll within the available viewport, keeping this display control close without allowing the page behind it to scroll along.</p>
          <p>Reference <ProtectedText>ARC-DISPLAY-OPTIONS-WITH-A-DELIBERATELY-UNBROKEN-IDENTIFIER</ProtectedText> remains readable beside every viewport edge.</p>
        </div>
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
      code={`<Tooltip label="Download a Local Copy">\n  <IconButton label="Download Resource">\n    <Download aria-hidden="true" />\n  </IconButton>\n</Tooltip>`}
    >
      <div className="arc-demo-row">
        <Tooltip label="Download a Local Copy"><IconButton label="Download Resource" onClick={() => setAction('You downloaded a local resource copy.')}><Download size={18} aria-hidden="true" /></IconButton></Tooltip>
        <Tooltip label="Search This Collection"><IconButton label="Search Collection" onClick={() => setAction('You searched this collection.')}><Search size={18} aria-hidden="true" /></IconButton></Tooltip>
        <span className="arc-demo-note" aria-live="polite">{action}</span>
      </div>
    </Specimen>
  );
}

interface DemoToast { id: number; title: string; message: ReactNode; tone: 'success' | 'info' | 'danger' }
function ToastSpecimen() {
  const [toasts, setToasts] = useState<DemoToast[]>([]);
  const [nextId, setNextId] = useState(1);
  function notify(tone: DemoToast['tone']) {
    const copy = tone === 'success'
      ? { title: 'You Saved Changes', message: 'Your local edits are ready to review.' }
      : tone === 'danger'
        ? { title: 'Complete Your Review', message: 'The summary is ready, but you still need to add a complete citation and finish an accessibility review before you share the collection with the wider reading group.' }
        : { title: 'Related Reference Ready', message: <>Find <ProtectedText>ARCHIVALREFERENCE-7F42C9A88D1E6B20-READINGROOM-CATALOGUE-WITHOUT-BREAKS</ProtectedText> in your local collection.</> };
    setToasts((items) => [...items, { id: nextId, tone, ...copy }]);
    setNextId((id) => id + 1);
  }
  return (
    <>
      <Specimen title="Toast" description="Brief status messages appear above the page without stealing focus. Every toast has an explicit dismiss action and an appropriate live-region role." code={`<ToastRegion>\n  <Toast tone="success" title="You Saved Changes"\n    message="Your local edits are ready to review."\n    onDismiss={() => remove(id)} />\n</ToastRegion>`}>
        <div className="arc-demo-row"><Button onClick={() => notify('success')}>Show Success Toast</Button><Button variant="secondary" onClick={() => notify('danger')}>Show Review Toast</Button><Button variant="quiet" onClick={() => notify('info')}>Show Reference Toast</Button></div>
        <p className="arc-demo-note">Toasts remain until you dismiss them, so you have time to read every message.</p>
      </Specimen>
      {toasts.length > 0 && <ToastRegion>{toasts.map((toast) => <Toast key={toast.id} {...toast} onDismiss={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} />)}</ToastRegion>}
    </>
  );
}

function BadgeSpecimen() {
  return (
    <Specimen title="Badge" description="Badges classify compact status or metadata. Strong foregrounds meet their tinted grounds; labels stay short and literal." code={`<Badge>Reference</Badge>\n<Badge tone="accent">New Edition</Badge>\n<Badge tone="success">Verified</Badge>`}>
      <div className="arc-demo-stack"><div className="arc-demo-row"><Badge>Reference</Badge><Badge tone="accent">New Edition</Badge><Badge tone="success"><Check size={12} aria-hidden="true" /> Verified</Badge><Badge tone="danger">Needs Review</Badge><Badge tone="info">In Progress</Badge></div><Badge tone="neutral">Extended classification remains readable</Badge></div>
    </Specimen>
  );
}

function AvatarSpecimen() {
  return (
    <Specimen title="Avatar" description="Initial-based avatars avoid external images while retaining a useful accessible name. 3 sizes support dense lists through featured bylines." code={`<Avatar name="Ada Lovelace" size="small" />\n<Avatar name="Grace Hopper" marked />\n<Avatar name="Katherine Johnson" size="large" />`}>
      <div className="arc-avatar-demo"><Avatar name="Ada Lovelace" size="small" /><Avatar name="Grace Hopper" marked /><Avatar name="Katherine Johnson" size="large" /><div><strong>Katherine Johnson</strong><p>Large avatar with a 2-line byline</p></div></div>
    </Specimen>
  );
}

function CardSpecimen() {
  const [notesVisible, setNotesVisible] = useState(false);
  return (
    <Specimen title="Card" description="Cards group one coherent subject. A crisp rule and restrained offset create depth; an optional botanical accent distinguishes a featured item." code={`<Card eyebrow={\`FIELD GUIDE / \${formatLedgerNumber(4)}\`} title="A Considered Summary"\n  footer={<Button variant="quiet">Read Summary Notes</Button>}>\n  <p>Related content with one clear destination.</p>\n</Card>`}>
      <div className="arc-card-demo-grid"><Card eyebrow={`FIELD GUIDE / ${formatLedgerNumber(4)}`} title="A Considered Summary" footer={<Button variant="quiet" aria-expanded={notesVisible} onClick={() => setNotesVisible((value) => !value)}>{notesVisible ? 'Hide Summary Notes' : 'Read Summary Notes'} <FileText size={15} aria-hidden="true" /></Button>}><p>Keep one subject and one primary destination within each card.</p>{notesVisible && <p className="arc-demo-note">Notes: retain a concise summary and avoid competing destinations. <ProtectedText>ARCHIVECARDREFERENCE-7F42C9A88D1E6B20-WITHOUT-BREAKS</ProtectedText> remains readable even when the card narrows.</p>}</Card><Card accent eyebrow={`FEATURED / ${formatLedgerNumber(7)}`} title="A Little More Expression" footer={<Badge tone="accent">Featured</Badge>}><p>The curved accent is decorative, leaving the reading order unchanged.</p></Card></div>
    </Specimen>
  );
}

const resourceRows = [
  { resource: <span className="arc-resource-cell"><Leaf size={15} aria-hidden="true" /> Botanical index</span>, kind: 'Reference', status: <Badge tone="success">Current</Badge>, revisedAt: '2026-11-12', entries: 128 },
  { resource: <span className="arc-resource-cell"><FileText size={15} aria-hidden="true" /> Editorial methods</span>, kind: 'Guide', status: <Badge tone="info">In review</Badge>, revisedAt: '2026-11-08', entries: 42 },
  { resource: <span className="arc-resource-cell"><Mail size={15} aria-hidden="true" /> Correspondence patterns</span>, kind: 'Collection', status: <Badge>Draft</Badge>, revisedAt: '2026-11-01', entries: 86 },
];
const largeResourceTopics = ['Botanical index', 'Editorial methods', 'Correspondence patterns', 'Reading observations', 'Garden marginalia', 'Commonplace references'];
const largeResourceVariants = [
  { kind: 'Reference', status: <Badge tone="success">Current</Badge> },
  { kind: 'Guide', status: <Badge tone="info">In review</Badge> },
  { kind: 'Collection', status: <Badge>Draft</Badge> },
];
const largeResourceRows = Array.from({ length: 51 }, (_, index) => {
  const title = index === 50 ? 'Catalogue of garden letters' : `${largeResourceTopics[index % largeResourceTopics.length]} ${formatLedgerNumber(index + 1)}`;
  const month = String((index % 9) + 1).padStart(2, '0');
  const day = String((index % 27) + 1).padStart(2, '0');
  return {
    resource: <span className="arc-resource-cell"><FileText size={15} aria-hidden="true" />{title}</span>,
    ...largeResourceVariants[index % largeResourceVariants.length],
    revisedAt: `2026-${month}-${day}`,
    entries: 24 + index * 3,
  };
});
function TableSpecimen() {
  const [empty, setEmpty] = useState(false);
  const [large, setLarge] = useState(false);
  const rows = large ? largeResourceRows : resourceRows;
  return (
    <Specimen title="Table" description="Semantic headers, a useful caption, and numeric alignment make comparison easy. Beyond 50 rows, pagination bounds rendering without changing the native table or its reading order." code={`<Table caption="Resource register"\n  columns={[{ key: 'resource', label: 'Resource' }, …]}\n  rows={rows.map((row) => ({ ...row,\n    revised: <time dateTime={row.revisedAt}>{formatDate(row.revisedAt)}</time>,\n    entries: formatNumber(row.entries) }))}\n  emptyMessage="No resources match this view." />`}>
      <div className="arc-demo-stack"><Table caption="Resource register" columns={[{ key: 'resource', label: 'Resource' }, { key: 'kind', label: 'Format' }, { key: 'status', label: 'Status' }, { key: 'revised', label: 'Revised' }, { key: 'entries', label: 'Entries', numeric: true }]} rows={empty ? [] : rows.map(({ revisedAt, entries, ...row }) => ({ ...row, revised: <time dateTime={revisedAt}>{formatDate(revisedAt)}</time>, entries: formatNumber(entries) }))} emptyMessage="No resources match this view. Reset the example to restore them." /><div className="arc-demo-row"><Button variant="quiet" onClick={() => setLarge((value) => !value)}>{large ? 'Show Original Resource Rows' : 'Show 51 Resource Rows'}</Button><Button variant="quiet" onClick={() => setEmpty((value) => !value)}>{empty ? 'Restore Resource Rows' : 'Show Empty Table State'}</Button></div></div>
    </Specimen>
  );
}

function PaginationSpecimen() {
  const { page, setPage, getPageUrl } = useShowcaseUrlState();
  return (
    <Specimen title="Pagination" description="Ellipses keep long ranges compact while first, last, and adjacent pages remain available. Current, previous, and next states are explicit." code={`const { page, setPage, getPageUrl } = useShowcaseUrlState();\n<Pagination currentPage={page} totalPages={8}\n  getPageUrl={getPageUrl} onPageChange={setPage} />`}>
      <div className="arc-demo-stack"><Pagination currentPage={page} totalPages={8} onPageChange={setPage} getPageUrl={getPageUrl} /><p className="arc-demo-note" aria-live="polite">Page {formatNumber(page)} of {formatNumber(8)}. Select a page or use the previous and next links.</p></div>
    </Specimen>
  );
}

export function ComponentsSection() {
  return (
    <section id="components" className="arc-section arc-components" aria-labelledby="section-6">
      <SectionHeading number={6} eyebrow="System / components" title="19 Instruments, One Register.">
        Each specimen is live, local, and built with semantic <ProtectedText>HTML</ProtectedText>. Expand its source for a concise <ProtectedText>React</ProtectedText> implementation reference.
      </SectionHeading>
      <nav className="arc-component-index" aria-label="Component index">
        {['Button', 'Icon Button', 'Text Input', 'Textarea', 'Select', 'Checkbox', 'Radio Group', 'Switch', 'Slider', 'Tabs', 'Dialog', 'Popover', 'Tooltip', 'Toast', 'Badge', 'Avatar', 'Card', 'Table', 'Pagination'].map((item, index) => <a key={item} href={`#specimen-${item.toLowerCase().replaceAll(' ', '-')}`}><span>{formatLedgerNumber(index + 1)}</span>{item}</a>)}
      </nav>
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
