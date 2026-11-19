import { ArrowRight, FolderInput, Layers3, Play, Settings2 } from 'lucide-react';
import { Button } from '../components';
import { formatDate, formatLedgerNumber, formatNumber } from '../intl';
import { defaultPracticeOptions } from './practice';
import { FolderIndex } from './FolderIndex';
import { RouteLink, SetCardPreview } from './ui';
import type { FlashcardLibrary, PracticeSession } from './types';
import type { FlashcardRoute } from './urlState';

interface HomeProps {
  library: FlashcardLibrary;
  session: PracticeSession | null;
  showAll: boolean;
  selectedSetId?: string;
  onNavigate: (route: FlashcardRoute) => void;
  onNewFolder: () => void;
  onResume: () => void;
  onPracticeFolders: (folderIds: string[]) => void;
  onClearLibrary: () => void;
  onRestoreLibrary: () => void;
}

export function Home({ library, session, showAll, selectedSetId, onNavigate, onNewFolder, onResume, onPracticeFolders, onClearLibrary, onRestoreLibrary }: HomeProps) {
  const sets = [...library.sets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const selected = sets.find((set) => set.id === selectedSetId) ?? sets[0] ?? null;
  const visibleSets = showAll ? sets : sets.slice(0, 6);
  const options = selected ? defaultPracticeOptions(library, { kind: 'set', setId: selected.id }) : null;

  return (
    <div className="fc-home">
      <section className="fc-study-stage" aria-labelledby="selected-set-heading">
        {selected ? (
          <>
            <header className="fc-stage-heading">
              <div>
                <h1 id="selected-set-heading" dir="auto">{selected.name}</h1>
                <p>{formatNumber(selected.cards.length)} {selected.cards.length === 1 ? 'card' : 'cards'} · {formatNumber(selected.fields.length)} named fields{selected.folderIds.length ? ` · filed in ${formatNumber(selected.folderIds.length)} ${selected.folderIds.length === 1 ? 'folder' : 'folders'}` : ' · unfiled'}</p>
              </div>
              <div className="fc-actions">
                <RouteLink className="fc-button-link" route={{ view: 'edit', setId: selected.id }} onNavigate={onNavigate}><Settings2 size={16} aria-hidden="true" />Edit set</RouteLink>
                <RouteLink className="fc-text-link" route={{ view: 'home', showAll: !showAll, selectedSetId: selected.id }} onNavigate={onNavigate}>{showAll ? 'Show six' : `Show all ${formatNumber(sets.length)} sets`}</RouteLink>
              </div>
            </header>

            <div className="fc-preview-workspace">
              <div className="fc-card-space"><SetCardPreview set={selected} frontFields={options?.frontFields ?? []} backFields={options?.backFields ?? []} /></div>
              <section className="fc-practice-panel" aria-labelledby="practice-panel-heading">
                <h2 id="practice-panel-heading">Start where the card is.</h2>
                <p>Choose each side, then practise in small batches. Unknown cards return in the next batch.</p>
                <dl className="fc-field-ledger">
                  <div><dt>Scope</dt><dd>This set</dd></div>
                  <div><dt>Front</dt><dd>{options?.frontFields.join(' + ') || 'Choose in setup'}</dd></div>
                  <div><dt>Back</dt><dd>{options?.backFields.join(' + ') || 'Choose in setup'}</dd></div>
                </dl>
                <Button disabled={!selected.cards.length} onClick={() => onNavigate({ view: 'setup', scope: { kind: 'set', setId: selected.id } })}>
                  <Play size={17} aria-hidden="true" />Practice this set<ArrowRight size={17} aria-hidden="true" />
                </Button>
                {!selected.cards.length && <p className="fc-inline-note" role="status">Add at least one card before practising this empty set.</p>}
                <RouteLink className="fc-quiet-link" route={{ view: 'set', setId: selected.id }} onNavigate={onNavigate}>View all cards<ArrowRight size={15} aria-hidden="true" /></RouteLink>
              </section>
            </div>
          </>
        ) : (
          <div className="fc-empty-desk">
            <Layers3 size={38} strokeWidth={1.2} aria-hidden="true" />
            <h1 id="selected-set-heading">Make your first set.</h1>
            <p>Start with Front and Back, then add more named fields whenever the material asks for them.</p>
            <Button onClick={() => onNavigate({ view: 'edit', setId: null })}>New set<ArrowRight size={17} aria-hidden="true" /></Button>
          </div>
        )}

        <section className="fc-recent" aria-labelledby="recent-heading">
          <div className="fc-section-title-row">
            <div><h2 id="recent-heading">{showAll ? 'Every set' : 'Recent sets'}</h2></div>
            <span>{formatNumber(sets.length)} in your library</span>
          </div>
          {visibleSets.length ? (
            <ol className={showAll ? 'fc-recent-list' : 'fc-recent-switcher'}>
              {visibleSets.map((set, index) => showAll ? (
                <li key={set.id}>
                  <span className="fc-recent-list__number">{formatLedgerNumber(index + 1)}</span>
                  <RouteLink route={{ view: 'home', showAll: true, selectedSetId: set.id }} onNavigate={onNavigate} className="fc-recent-list__name">{set.name}</RouteLink>
                  <span className="fc-recent-list__meta">{formatNumber(set.cards.length)} cards · {formatNumber(set.fields.length)} fields</span>
                  <time dateTime={set.createdAt}>{formatDate(set.createdAt, { day: 'numeric', month: 'short' })}</time>
                  <RouteLink route={{ view: 'edit', setId: set.id }} onNavigate={onNavigate} className="fc-quiet-link" aria-label={`Edit ${set.name}`}>Edit</RouteLink>
                </li>
              ) : (
                <li key={set.id} className={selected?.id === set.id ? 'is-selected' : undefined}>
                  <RouteLink route={{ view: 'home', showAll: false, selectedSetId: set.id }} onNavigate={onNavigate} className="fc-recent-choice" aria-current={selected?.id === set.id ? 'page' : undefined}>
                    <span className="fc-recent-list__number"><span className="fc-sr-only">Set </span>{formatLedgerNumber(index + 1)}</span>
                    <strong dir="auto">{set.name}</strong>
                    <span className="fc-recent-list__meta">{formatNumber(set.cards.length)} cards · {formatNumber(set.fields.length)} fields</span>
                    <time dateTime={set.createdAt}>{formatDate(set.createdAt, { day: 'numeric', month: 'short' })}</time>
                  </RouteLink>
                </li>
              ))}
            </ol>
          ) : <p>No sets here yet.</p>}
        </section>
      </section>

      <div className="fc-home__side">
        <FolderIndex library={library} session={session} onNavigate={onNavigate} onNewFolder={onNewFolder} onResume={onResume} onPracticeFolders={onPracticeFolders} />
        <section className="fc-library-tools" aria-labelledby="library-tools-heading">
          <h2 id="library-tools-heading"><FolderInput size={18} aria-hidden="true" />Local library</h2>
          <p>Saved in this browser only. Replace everything with examples or clear the library after confirmation.</p>
          <div className="fc-actions"><Button variant="quiet" onClick={onClearLibrary}>Clear library</Button><Button variant="quiet" className="fc-danger-action" onClick={onRestoreLibrary}>Replace library with examples…</Button></div>
        </section>
      </div>
    </div>
  );
}
