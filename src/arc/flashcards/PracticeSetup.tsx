import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Layers3, Play, Shuffle } from 'lucide-react';
import { Button, Checkbox } from '../components';
import { formatNumber } from '../intl';
import { defaultPracticeOptions, isSimpleTwoFieldScope, practiceEligibility, scopeFieldNames, scopedSets } from './practice';
import { RouteLink } from './ui';
import type { FlashcardLibrary, PracticeOptions, PracticeScope } from './types';
import type { FlashcardRoute } from './urlState';

interface PracticeSetupProps {
  library: FlashcardLibrary;
  initialScope: PracticeScope;
  onNavigate: (route: FlashcardRoute) => void;
  onStart: (options: PracticeOptions) => void;
}

export function PracticeSetup({ library, initialScope, onNavigate, onStart }: PracticeSetupProps) {
  const [options, setOptions] = useState<PracticeOptions>(() => defaultPracticeOptions(library, initialScope));
  const sets = useMemo(() => scopedSets(library, options.scope), [library, options.scope]);
  const fields = useMemo(() => scopeFieldNames(library, options.scope), [library, options.scope]);
  const simple = isSimpleTwoFieldScope(library, options.scope);
  const { eligible, skipped } = practiceEligibility(library, options);
  const selectionValid = options.scope.kind === 'set' || options.scope.folderIds.length > 0;
  const fieldsValid = options.direction ? fields.length >= 2 : options.frontFields.length > 0 && options.backFields.length > 0 && !options.frontFields.some((field) => options.backFields.includes(field));

  function changeScope(scope: PracticeScope) {
    setOptions(defaultPracticeOptions(library, scope));
  }

  function setDirection(direction: 'front-first' | 'back-first') {
    const setFields = sets[0]?.fields.map((field) => field.name) ?? [];
    setOptions((current) => ({
      ...current,
      direction,
      frontFields: setFields.length ? [setFields[direction === 'front-first' ? 0 : 1]] : [],
      backFields: setFields.length ? [setFields[direction === 'front-first' ? 1 : 0]] : [],
    }));
  }

  function toggleField(side: 'frontFields' | 'backFields', field: string, checked: boolean) {
    setOptions((current) => ({
      ...current,
      direction: undefined,
      [side]: checked ? [...current[side], field] : current[side].filter((item) => item !== field),
    }));
  }

  return (
    <div className="fc-setup">
      <nav className="fc-breadcrumbs" aria-label="Breadcrumb"><RouteLink route={{ view: 'home', showAll: false }} onNavigate={onNavigate}><ArrowLeft size={14} aria-hidden="true" />Study desk</RouteLink><span aria-current="page">Practice setup</span></nav>
      <header className="fc-page-heading"><div><h1>Set up practice.</h1><p>Choose what to practise and what appears on each side of the card.</p></div></header>

      <div className="fc-setup__layout">
        <div className="fc-setup__form">
          <section className="fc-setup-section" aria-labelledby="scope-heading">
            <div className="fc-section-title-row"><h2 id="scope-heading">01 · What to practise</h2><span>{formatNumber(sets.length)} unique {sets.length === 1 ? 'set' : 'sets'}</span></div>
            {options.scope.kind === 'set' ? (
              <div className="fc-selected-scope"><Layers3 size={25} strokeWidth={1.3} aria-hidden="true" /><div><strong>{sets[0]?.name ?? 'This set is no longer available'}</strong><p>One set. Cards stay in editor order unless you shuffle them.</p></div></div>
            ) : (
              <fieldset className="fc-setup-folder-options"><legend>Choose folders; every selection includes its descendants</legend>{library.folders.map((folder) => (
                <Checkbox key={folder.id} label={folder.name} description={folder.parentId ? `Inside ${library.folders.find((item) => item.id === folder.parentId)?.name ?? 'folder'}` : 'Top-level folder'} checked={options.scope.kind === 'folders' && options.scope.folderIds.includes(folder.id)} onChange={(event) => {
                  if (options.scope.kind !== 'folders') return;
                  const folderIds = event.target.checked ? [...options.scope.folderIds, folder.id] : options.scope.folderIds.filter((id) => id !== folder.id);
                  changeScope({ kind: 'folders', folderIds });
                }} />
              ))}</fieldset>
            )}
            <Button variant="quiet" onClick={() => options.scope.kind === 'set'
              ? changeScope({ kind: 'folders', folderIds: [] })
              : initialScope.kind === 'set' ? changeScope(initialScope) : changeScope({ kind: 'folders', folderIds: [] })}>
              {options.scope.kind === 'set' ? 'Choose folders instead' : initialScope.kind === 'set' ? 'Practise the single set instead' : 'Clear folder selection'}
            </Button>
          </section>

          <section className="fc-setup-section" aria-labelledby="sides-heading">
            <div className="fc-section-title-row"><h2 id="sides-heading">02 · Fields available on these cards</h2><span>{formatNumber(fields.length)} {fields.length === 1 ? 'field' : 'fields'}</span></div>
            <p className="fc-setup-hint">Only cards containing every chosen field are included. Other cards are skipped without being changed.</p>
            {simple && options.direction ? (
              <fieldset className="fc-direction-options"><legend>Two-field behaviour</legend>
                <label><input type="radio" name="practice-direction" value="front-first" checked={options.direction === 'front-first'} onChange={() => setDirection('front-first')} /><span><strong>Front first</strong><small>{sets[0]?.fields[0]?.name} → {sets[0]?.fields[1]?.name}</small></span></label>
                <label><input type="radio" name="practice-direction" value="back-first" checked={options.direction === 'back-first'} onChange={() => setDirection('back-first')} /><span><strong>Back first</strong><small>{sets[0]?.fields[1]?.name} → {sets[0]?.fields[0]?.name}</small></span></label>
              </fieldset>
            ) : (
              <div className="fc-field-options">
                {(['frontFields', 'backFields'] as const).map((side) => (
                  <fieldset key={side}><legend>{side === 'frontFields' ? 'Front fields' : 'Back fields'}</legend><p>Choose multiple fields; their content will stack without labels.</p>{fields.map((field) => {
                    const otherSide = side === 'frontFields' ? 'backFields' : 'frontFields';
                    const disabled = options[otherSide].includes(field);
                    return <Checkbox key={field} label={field} checked={options[side].includes(field)} disabled={disabled} title={disabled ? `${field} is already on the other side.` : undefined} onChange={(event) => toggleField(side, field, event.target.checked)} />;
                  })}</fieldset>
                ))}
              </div>
            )}
            {!fieldsValid && <p className="fc-form-error" role="alert">Choose at least one front field and one back field. The same field cannot appear on both sides.</p>}
          </section>

          <section className="fc-setup-section" aria-labelledby="order-heading">
            <div className="fc-section-title-row"><h2 id="order-heading">03 · Order</h2></div>
            <Checkbox label="Shuffle matching cards" description="Off keeps editor order within each set and puts newer sets first when practising folders." checked={options.shuffle} onChange={(event) => setOptions((current) => ({ ...current, shuffle: event.target.checked }))} />
            {!options.shuffle && <p className="fc-order-note"><Shuffle size={17} aria-hidden="true" />Editor order · newest sets first</p>}
          </section>
        </div>

        <aside className="fc-eligibility" aria-labelledby="eligibility-heading">
          <h2 id="eligibility-heading">{formatNumber(eligible.length)} {eligible.length === 1 ? 'card matches' : 'cards match'} these sides</h2>
          <dl><div><dt>Skipped</dt><dd>{formatNumber(skipped)}</dd></div><div><dt>First batch</dt><dd>{formatNumber(Math.min(10, eligible.length))}</dd></div></dl>
          {!eligible.length && <p className="fc-form-error" role="alert">No cards match these sides. Choose different fields or more folders before starting.</p>}
          {!selectionValid && <p className="fc-form-error" role="alert">Choose at least one folder.</p>}
          <Button disabled={!eligible.length || !fieldsValid || !selectionValid} onClick={() => onStart(options)}><Play size={17} aria-hidden="true" />Start practice<ArrowRight size={17} aria-hidden="true" /></Button>
          <p className="fc-eligibility__note">Starting a new session will ask before replacing an existing paused session.</p>
        </aside>
      </div>
    </div>
  );
}
