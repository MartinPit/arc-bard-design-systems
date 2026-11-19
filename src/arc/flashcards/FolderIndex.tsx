import { useMemo, useState } from 'react';
import { ArrowRight, Folder, Play, Plus } from 'lucide-react';
import { Button, Checkbox } from '../components';
import { formatNumber } from '../intl';
import { scopedSets } from './practice';
import { RouteLink } from './ui';
import type { FlashcardLibrary, PracticeSession } from './types';
import type { FlashcardRoute } from './urlState';

interface FolderIndexProps {
  library: FlashcardLibrary;
  session: PracticeSession | null;
  onNavigate: (route: FlashcardRoute) => void;
  onNewFolder: () => void;
  onResume: () => void;
  onPracticeFolders: (folderIds: string[]) => void;
}

export function FolderIndex({ library, session, onNavigate, onNewFolder, onResume, onPracticeFolders }: FolderIndexProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const roots = useMemo(() => library.folders.filter((folder) => folder.parentId === null), [library.folders]);

  function renderFolder(id: string, depth: number): React.ReactNode {
    const folder = library.folders.find((item) => item.id === id);
    if (!folder) return null;
    const children = library.folders.filter((item) => item.parentId === id);
    const recursiveCount = scopedSets(library, { kind: 'folders', folderIds: [id] }).length;
    return (
      <li key={id} className="fc-folder-node">
        <div className="fc-folder-node__line" style={{ '--fc-folder-depth': depth } as React.CSSProperties}>
          <RouteLink route={{ view: 'folder', folderId: id }} onNavigate={onNavigate} className="fc-folder-link">
            <Folder size={15} strokeWidth={1.6} aria-hidden="true" /><span>{folder.name}<small>{formatNumber(recursiveCount)} {recursiveCount === 1 ? 'set' : 'sets'} incl. subfolders</small></span>
          </RouteLink>
          <Checkbox
            className="fc-folder-select"
            label={`Select ${folder.name} for practice`}
            checked={selected.includes(id)}
            onChange={(event) => setSelected((current) => event.target.checked ? [...current, id] : current.filter((item) => item !== id))}
          />
        </div>
        {children.length > 0 && <ul>{children.map((child) => renderFolder(child.id, depth + 1))}</ul>}
      </li>
    );
  }

  return (
    <aside className="fc-folder-index" aria-labelledby="folder-index-heading">
      <div className="fc-folder-index__heading">
        <h2 id="folder-index-heading">All folders</h2>
        <p>Every branch. Practise one, several, or an entire family.</p>
      </div>
      <Button variant="secondary" onClick={onNewFolder}><Plus size={16} aria-hidden="true" />New folder</Button>
      {session && (
        <section className="fc-resume" aria-labelledby="resume-heading">
          <h3 id="resume-heading">{session.title}</h3>
          <p>One paused session</p>
          <p>{formatNumber(session.known)} known · {formatNumber(session.repeated)} repeated</p>
          <Button onClick={onResume}><Play size={16} aria-hidden="true" />Resume practice<ArrowRight size={16} aria-hidden="true" /></Button>
        </section>
      )}
      {roots.length ? <ul className="fc-folder-tree">{roots.map((folder) => renderFolder(folder.id, 0))}</ul> : <p className="fc-folder-index__empty">No folders. Sets can stay unfiled, or you can make a folder to begin.</p>}
      <div className={`fc-practice-selected${selected.length ? ' is-active' : ''}`}>
        <Button disabled={!selected.length} onClick={() => onPracticeFolders(selected)}><Play size={16} aria-hidden="true" />Practice selected folders</Button>
        <small aria-live="polite" aria-atomic="true">{selected.length ? `${formatNumber(selected.length)} ${selected.length === 1 ? 'folder' : 'folders'} selected. Subfolders are included.` : 'Choose folders to practise. Subfolders are included.'}</small>
      </div>
    </aside>
  );
}
