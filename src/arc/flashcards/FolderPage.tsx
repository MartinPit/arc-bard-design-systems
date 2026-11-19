import { ArrowRight, Folder as FolderIcon, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components';
import { formatNumber } from '../intl';
import { descendantFolderIds, scopedSets } from './practice';
import { RouteLink } from './ui';
import type { FlashcardFolder, FlashcardLibrary } from './types';
import type { FlashcardRoute } from './urlState';

interface FolderPageProps {
  library: FlashcardLibrary;
  folder: FlashcardFolder;
  onNavigate: (route: FlashcardRoute) => void;
  onNewFolder: (parentId: string | null) => void;
  onRenameFolder: (folder: FlashcardFolder) => void;
  onDeleteFolder: (folder: FlashcardFolder) => void;
}

export function FolderPage({ library, folder, onNavigate, onNewFolder, onRenameFolder, onDeleteFolder }: FolderPageProps) {
  const children = library.folders.filter((item) => item.parentId === folder.id);
  const directSets = library.sets.filter((set) => set.folderIds.includes(folder.id));
  const scoped = scopedSets(library, { kind: 'folders', folderIds: [folder.id] });
  const folderCount = descendantFolderIds(library, [folder.id]).size;
  const empty = children.length === 0 && directSets.length === 0;
  const ancestors: FlashcardFolder[] = [];
  let parentId = folder.parentId;
  const visited = new Set<string>();
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = library.folders.find((item) => item.id === parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    parentId = parent.parentId;
  }

  return (
    <div className="fc-folder-page">
      <nav className="fc-breadcrumbs" aria-label="Breadcrumb">
        <RouteLink route={{ view: 'home', showAll: false }} onNavigate={onNavigate}>Study desk</RouteLink>
        {ancestors.map((ancestor) => <RouteLink key={ancestor.id} route={{ view: 'folder', folderId: ancestor.id }} onNavigate={onNavigate}>{ancestor.name}</RouteLink>)}
        <span aria-current="page">{folder.name}</span>
      </nav>
      <header className="fc-page-heading">
        <div><h1 dir="auto">{folder.name}</h1><p>{formatNumber(folderCount)} {folderCount === 1 ? 'branch' : 'branches'} · {formatNumber(scoped.length)} unique sets across this folder and all descendants. Multiple paths never duplicate a practice card.</p></div>
        <div className="fc-actions">
          <Button variant="secondary" onClick={() => onNewFolder(folder.id)}><Plus size={16} aria-hidden="true" />New subfolder</Button>
          <Button disabled={!scoped.length} onClick={() => onNavigate({ view: 'setup', scope: { kind: 'folders', folderIds: [folder.id] } })}><Play size={16} aria-hidden="true" />Practice entire folder<ArrowRight size={16} aria-hidden="true" /></Button>
        </div>
      </header>
      <div className="fc-folder-configuration">
        <span>Parent folders are fixed after creation. Deleting a folder never deletes its sets.</span>
        <div className="fc-actions"><Button variant="quiet" onClick={() => onRenameFolder(folder)}><Pencil size={15} aria-hidden="true" />Rename folder</Button><Button variant="quiet" className="fc-danger-action" disabled={!empty} title={!empty ? 'Move all direct sets and subfolders out before deleting this folder.' : 'Delete this empty folder'} onClick={() => onDeleteFolder(folder)}><Trash2 size={15} aria-hidden="true" />Delete empty folder</Button></div>
      </div>
      <section className="fc-folder-contents" aria-labelledby="subfolders-heading">
        <div className="fc-section-title-row"><h2 id="subfolders-heading">Subfolders</h2><span>{formatNumber(children.length)}</span></div>
        {children.length ? <ul className="fc-subfolder-list">{children.map((child) => {
          const count = scopedSets(library, { kind: 'folders', folderIds: [child.id] }).length;
          return <li key={child.id}><RouteLink route={{ view: 'folder', folderId: child.id }} onNavigate={onNavigate}><FolderIcon size={20} strokeWidth={1.4} aria-hidden="true" /><span>{child.name}<small>{formatNumber(count)} unique sets including descendants</small></span><ArrowRight size={16} aria-hidden="true" /></RouteLink></li>;
        })}</ul> : <p>No direct subfolders.</p>}
      </section>
      <section className="fc-folder-contents" aria-labelledby="direct-sets-heading">
        <div className="fc-section-title-row"><h2 id="direct-sets-heading">Sets directly in {folder.name}</h2><span>{formatNumber(directSets.length)}</span></div>
        {directSets.length ? <ol className="fc-folder-set-list">{directSets.map((set) => <li key={set.id}><div><RouteLink route={{ view: 'set', setId: set.id }} onNavigate={onNavigate}>{set.name}</RouteLink><p>{formatNumber(set.cards.length)} cards · {set.fields.map((field) => field.name).join(' + ')}</p></div><Button variant="quiet" disabled={!set.cards.length} onClick={() => onNavigate({ view: 'setup', scope: { kind: 'set', setId: set.id } })}>Practice<ArrowRight size={15} aria-hidden="true" /></Button></li>)}</ol> : <p>No sets are directly filed here. Descendant sets still appear in folder practice.</p>}
      </section>
    </div>
  );
}
