import { ArrowLeft, ArrowRight, Folder, Play, Settings2, Trash2 } from 'lucide-react';
import { Button } from '../components';
import { RouteLink } from './ui';
import type { FlashcardLibrary, FlashcardSet } from './types';
import type { FlashcardRoute } from './urlState';

interface SetDetailProps {
  library: FlashcardLibrary;
  set: FlashcardSet;
  onNavigate: (route: FlashcardRoute) => void;
  onDelete: (set: FlashcardSet) => void;
}

export function SetDetail({ library, set, onNavigate, onDelete }: SetDetailProps) {
  return (
    <div className="fc-set-detail">
      <nav className="fc-breadcrumbs" aria-label="Breadcrumb"><RouteLink route={{ view: 'home', showAll: false }} onNavigate={onNavigate}><ArrowLeft size={14} aria-hidden="true" />Study desk</RouteLink><span aria-current="page">{set.name}</span></nav>
      <header className="fc-page-heading">
        <div><h1>{set.name}</h1><p>{set.cards.length} cards · Blank fields stay blank: each card uses only the part of the field vocabulary it needs.</p></div>
        <div className="fc-actions">
          <Button variant="secondary" onClick={() => onNavigate({ view: 'edit', setId: set.id })}><Settings2 size={16} aria-hidden="true" />Edit set</Button>
          <Button disabled={!set.cards.length} onClick={() => onNavigate({ view: 'setup', scope: { kind: 'set', setId: set.id } })}><Play size={16} aria-hidden="true" />Practice set<ArrowRight size={16} aria-hidden="true" /></Button>
        </div>
      </header>
      <section className="fc-set-filing" aria-labelledby="set-filing-heading">
        <h2 id="set-filing-heading"><Folder size={18} aria-hidden="true" />Filed in</h2>
        {set.folderIds.length ? <ul>{set.folderIds.map((id) => {
          const folder = library.folders.find((item) => item.id === id);
          return folder ? <li key={id}><RouteLink route={{ view: 'folder', folderId: id }} onNavigate={onNavigate}>{folder.name}</RouteLink></li> : null;
        })}</ul> : <p>Unfiled. Add any number of folder memberships in the editor.</p>}
      </section>
      {!set.cards.length && <div className="fc-inline-callout" role="status"><strong>This set is empty.</strong> Save is allowed; practice becomes available after you add a card.</div>}
      <section className="fc-card-list" aria-labelledby="all-cards-heading">
        <div className="fc-section-title-row"><h2 id="all-cards-heading">All cards</h2><span>{set.fields.map((field) => field.name).join(' · ')}</span></div>
        <ol>
          {set.cards.map((card, index) => (
            <li key={card.id}>
              <span className="fc-card-list__number" aria-label={`Card ${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
              <dl>{set.fields.map((field) => {
                const value = card.values[field.id]?.trim();
                return value ? <div key={field.id}><dt>{field.name}</dt><dd>{value}</dd></div> : null;
              })}</dl>
            </li>
          ))}
        </ol>
      </section>
      <section className="fc-danger-zone" aria-labelledby="delete-set-heading"><div><h2 id="delete-set-heading">Delete this set</h2><p>Folder memberships do not own a set. This action deletes the set and all of its cards.</p></div><Button variant="quiet" className="fc-danger-action" onClick={() => onDelete(set)}><Trash2 size={16} aria-hidden="true" />Delete set</Button></section>
    </div>
  );
}
