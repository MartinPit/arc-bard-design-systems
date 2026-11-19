import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { Button, Dialog, Select, TextInput } from '../components';
import { ThemeToggle } from '../components/ThemeToggle';
import { useArcTheme } from '../theme';
import { createExampleLibrary, createId, nextSetName } from './data';
import { FolderPage } from './FolderPage';
import { Home } from './Home';
import { loadFlashcardState, saveLibrary, saveSession } from './persistence';
import { createPracticeSession } from './practice';
import { PracticeSessionView } from './PracticeSessionView';
import { PracticeSetup } from './PracticeSetup';
import { SetDetail } from './SetDetail';
import { SetEditor } from './SetEditor';
import { ArcLeafMark, RouteLink } from './ui';
import { navigateUrl, useFlashcardRoute, type FlashcardRoute } from './urlState';
import type { FlashcardDraft, FlashcardFolder, FlashcardSet, PracticeOptions } from './types';
import './flashcards.css';

interface Confirmation {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
}

type FolderForm =
  | { mode: 'create'; parentId: string | null }
  | { mode: 'rename'; folderId: string };

export function Flashcards() {
  const { theme, toggleTheme } = useArcTheme();
  const route = useFlashcardRoute();
  const [initialState] = useState(loadFlashcardState);
  const [library, setLibrary] = useState(initialState.library);
  const [session, setSession] = useState(initialState.session);
  const [notice, setNotice] = useState(initialState.recovered ? 'Some saved Flashcards data could not be read. Safe example data was restored where needed.' : '');
  const [persistenceErrors, setPersistenceErrors] = useState({ library: false, session: false });
  const [storageRetry, setStorageRetry] = useState(0);
  const persistenceFailed = persistenceErrors.library || persistenceErrors.session;
  const [editorDirty, setEditorDirty] = useState(false);
  const editorDirtyRef = useRef(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [folderForm, setFolderForm] = useState<FolderForm | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderParent, setFolderParent] = useState<string | null>(null);
  const [folderError, setFolderError] = useState('');
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const failed = !saveLibrary(library);
    setPersistenceErrors((current) => current.library === failed ? current : { ...current, library: failed });
  }, [library, storageRetry]);
  useEffect(() => {
    const failed = !saveSession(session);
    setPersistenceErrors((current) => current.session === failed ? current : { ...current, session: failed });
  }, [session, storageRetry]);

  useEffect(() => {
    if (!editorDirty && !persistenceFailed) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [editorDirty, persistenceFailed]);

  const onDirtyChange = useCallback((dirty: boolean) => {
    editorDirtyRef.current = dirty;
    setEditorDirty(dirty);
  }, []);

  function commitNavigate(next: FlashcardRoute, replace = false) {
    navigateUrl(next, replace ? 'replace' : 'push');
  }

  function requestNavigate(next: FlashcardRoute) {
    if (editorDirtyRef.current) {
      setConfirmation({
        title: 'Leave this unsaved draft?',
        description: 'Your edits have not been saved. Leave without saving, or stay here and use Save set.',
        confirmLabel: 'Leave without saving',
        danger: true,
        onConfirm: () => {
          editorDirtyRef.current = false;
          setEditorDirty(false);
          commitNavigate(next);
        },
      });
      return;
    }
    commitNavigate(next);
  }

  useEffect(() => {
    const draftUrl = window.location.href;
    const protectBackForward = () => {
      if (!editorDirtyRef.current || window.location.href === draftUrl) return;
      window.history.pushState(window.history.state, '', draftUrl);
      setConfirmation({
        title: 'Leave this unsaved draft?',
        description: 'Browser navigation would discard your unsaved edits. Leave without saving, or stay on this draft.',
        confirmLabel: 'Leave without saving',
        danger: true,
        onConfirm: () => {
          editorDirtyRef.current = false;
          setEditorDirty(false);
          window.history.back();
        },
      });
    };
    if (editorDirty) window.addEventListener('popstate', protectBackForward, true);
    return () => window.removeEventListener('popstate', protectBackForward, true);
  }, [editorDirty]);

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [route]);

  function announce(message: string) {
    setNotice(message);
  }

  function startPractice(options: PracticeOptions) {
    const next = createPracticeSession(library, options);
    if (!next.total) {
      announce('No eligible cards can start this session. Change the practice options.');
      return;
    }
    const begin = () => {
      setSession(next);
      commitNavigate({ view: 'practice' });
    };
    if (session) {
      setConfirmation({
        title: 'Replace your paused session?',
        description: `Only one practice session can be active. Starting “${next.title}” replaces “${session.title}”; your library is not affected.`,
        confirmLabel: 'Replace and start',
        danger: true,
        onConfirm: begin,
      });
    } else begin();
  }

  function openFolderForm(form: FolderForm) {
    setFolderForm(form);
    setFolderError('');
    if (form.mode === 'create') {
      setFolderName('');
      setFolderParent(form.parentId);
    } else {
      const folder = library.folders.find((item) => item.id === form.folderId);
      setFolderName(folder?.name ?? '');
      setFolderParent(folder?.parentId ?? null);
    }
  }

  function saveFolder(event: FormEvent) {
    event.preventDefault();
    const name = folderName.trim();
    if (!name) {
      setFolderError('Enter a folder name.');
      return;
    }
    const parentId = folderForm?.mode === 'create' ? folderParent : library.folders.find((folder) => folder.id === (folderForm as { folderId?: string })?.folderId)?.parentId ?? null;
    if (library.folders.some((folder) => folder.parentId === parentId && folder.name.toLocaleLowerCase() === name.toLocaleLowerCase() && (folderForm?.mode !== 'rename' || folder.id !== folderForm.folderId))) {
      setFolderError('A folder with this name already exists in the same parent.');
      return;
    }
    if (folderForm?.mode === 'create') {
      setLibrary((current) => ({ ...current, folders: [...current.folders, { id: createId('folder'), name, parentId }] }));
      announce(`Folder “${name}” created on this device.`);
    } else if (folderForm?.mode === 'rename') {
      setLibrary((current) => ({ ...current, folders: current.folders.map((folder) => folder.id === folderForm.folderId ? { ...folder, name } : folder) }));
      announce(`Folder renamed to “${name}”.`);
    }
    setFolderForm(null);
  }

  function confirmDeleteFolder(folder: FlashcardFolder) {
    const hasChildren = library.folders.some((item) => item.parentId === folder.id);
    const hasSets = library.sets.some((set) => set.folderIds.includes(folder.id));
    if (hasChildren || hasSets) {
      announce('Only empty folders can be deleted. Remove direct memberships and subfolders first.');
      return;
    }
    setConfirmation({
      title: `Delete “${folder.name}”?`,
      description: 'This empty folder will be removed. Sets in other folders are never affected.',
      confirmLabel: 'Delete empty folder',
      danger: true,
      onConfirm: () => {
        setLibrary((current) => ({ ...current, folders: current.folders.filter((item) => item.id !== folder.id) }));
        commitNavigate({ view: 'home', showAll: false });
      },
    });
  }

  function confirmDeleteSet(set: FlashcardSet) {
    setConfirmation({
      title: `Delete “${set.name}”?`,
      description: `This permanently deletes the set and its ${set.cards.length} cards from this browser. Removing a folder membership would not delete the set.`,
      confirmLabel: 'Delete set',
      danger: true,
      onConfirm: () => {
        setLibrary((current) => ({ ...current, sets: current.sets.filter((item) => item.id !== set.id) }));
        setSession((current) => current?.options.scope.kind === 'set' && current.options.scope.setId === set.id ? null : current);
        commitNavigate({ view: 'home', showAll: false });
        announce(`“${set.name}” was deleted.`);
      },
    });
  }

  function saveSet(draft: FlashcardDraft) {
    const now = new Date().toISOString();
    const saved: FlashcardSet = {
      id: draft.id ?? createId('set'),
      name: draft.name,
      createdAt: draft.createdAt ?? now,
      updatedAt: now,
      folderIds: draft.folderIds,
      fields: draft.fields,
      cards: draft.cards,
    };
    setLibrary((current) => ({
      ...current,
      sets: current.sets.some((set) => set.id === saved.id) ? current.sets.map((set) => set.id === saved.id ? saved : set) : [saved, ...current.sets],
    }));
    editorDirtyRef.current = false;
    setEditorDirty(false);
    commitNavigate({ view: 'set', setId: saved.id });
    announce(`“${saved.name}” saved with ${saved.cards.length} ${saved.cards.length === 1 ? 'card' : 'cards'}.`);
  }

  function clearLibrary() {
    setConfirmation({
      title: 'Clear your entire library?',
      description: 'This removes every set, card, folder and paused practice session from this browser. Replace library with examples brings back only the seeded examples.',
      confirmLabel: 'Clear library',
      danger: true,
      onConfirm: () => {
        setLibrary({ version: 1, sets: [], folders: [] });
        setSession(null);
        commitNavigate({ view: 'home', showAll: false });
        announce('Your local Flashcards library is now empty.');
      },
    });
  }

  function restoreLibrary() {
    setConfirmation({
      title: 'Replace your entire library with examples?',
      description: `This permanently replaces your ${library.sets.length} ${library.sets.length === 1 ? 'set' : 'sets'}, every card and folder, and any paused practice session in this browser with the example library. This cannot be undone.`,
      confirmLabel: 'Replace entire library',
      danger: true,
      onConfirm: () => {
        setLibrary(createExampleLibrary());
        setSession(null);
        commitNavigate({ view: 'home', showAll: false });
        announce('Your library was replaced with the examples.');
      },
    });
  }

  const selectedSet = route.view === 'set' || (route.view === 'edit' && route.setId)
    ? library.sets.find((set) => set.id === route.setId)
    : undefined;
  const selectedFolder = route.view === 'folder' ? library.folders.find((folder) => folder.id === route.folderId) : undefined;
  const routeKey = JSON.stringify(route);

  let content: React.ReactNode;
  if (route.view === 'home') {
    content = <Home library={library} session={session} showAll={route.showAll} selectedSetId={route.selectedSetId} onNavigate={requestNavigate} onNewFolder={() => openFolderForm({ mode: 'create', parentId: null })} onResume={() => requestNavigate({ view: 'practice' })} onPracticeFolders={(folderIds) => requestNavigate({ view: 'setup', scope: { kind: 'folders', folderIds } })} onClearLibrary={clearLibrary} onRestoreLibrary={restoreLibrary} />;
  } else if (route.view === 'set' && selectedSet) {
    content = <SetDetail library={library} set={selectedSet} onNavigate={requestNavigate} onDelete={confirmDeleteSet} />;
  } else if (route.view === 'edit' && (route.setId === null || selectedSet)) {
    content = <SetEditor key={route.setId ?? 'new'} set={selectedSet ?? null} folders={library.folders} defaultName={selectedSet?.name || nextSetName(library.sets)} onSave={saveSet} onCancel={() => requestNavigate(selectedSet ? { view: 'set', setId: selectedSet.id } : { view: 'home', showAll: false })} onDirtyChange={onDirtyChange} />;
  } else if (route.view === 'folder' && selectedFolder) {
    content = <FolderPage library={library} folder={selectedFolder} onNavigate={requestNavigate} onNewFolder={(parentId) => openFolderForm({ mode: 'create', parentId })} onRenameFolder={(folder) => openFolderForm({ mode: 'rename', folderId: folder.id })} onDeleteFolder={confirmDeleteFolder} />;
  } else if (route.view === 'setup') {
    content = <PracticeSetup key={routeKey} library={library} initialScope={route.scope} onNavigate={requestNavigate} onStart={startPractice} />;
  } else if (route.view === 'practice' && session) {
    content = <PracticeSessionView session={session} onChange={setSession} onSuspend={() => requestNavigate({ view: 'home', showAll: false })} onFinish={() => { setSession(null); commitNavigate({ view: 'home', showAll: false }); }} />;
  } else {
    content = <section className="fc-not-found"><h1>Return to your study desk.</h1><p>The set, folder or paused session may have been removed.</p><Button onClick={() => requestNavigate({ view: 'home', showAll: false })}>Go to study desk<ArrowRight size={17} aria-hidden="true" /></Button></section>;
  }

  return (
    <div className="arc-root arc-flashcards">
      <a className="arc-skip-link" href="#flashcards-main">Skip to flashcards</a>
      <header className="fc-masthead">
        <RouteLink route={{ view: 'home', showAll: false }} onNavigate={requestNavigate} className="fc-brand" aria-label="Arc Flashcards study desk"><ArcLeafMark /><span>Arc <em>Flashcards</em></span></RouteLink>
        <p className="fc-tagline">Make a set. Keep what you know.</p>
        <div className="fc-masthead__actions"><ThemeToggle theme={theme} onToggle={toggleTheme} /><Button onClick={() => requestNavigate({ view: 'edit', setId: null })}><Plus size={17} aria-hidden="true" />New set</Button></div>
      </header>
      <div className="fc-app-notices">
        {persistenceFailed && <div className="fc-notice fc-notice--error" role="alert"><span>Browser storage is unavailable or full. Changes remain only in this tab and will be lost if you close or reload it. Allow site storage or free space, then try again.</span><button type="button" onClick={() => setStorageRetry((current) => current + 1)}>Try saving again</button></div>}
        {notice && <div className="fc-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')}>Dismiss</button></div>}
      </div>
      <main id="flashcards-main" className="fc-main" tabIndex={-1} ref={mainRef}>{content}</main>

      <Dialog open={Boolean(confirmation)} onOpenChange={(open) => { if (!open) setConfirmation(null); }} title={confirmation?.title ?? 'Confirm'} description={confirmation?.description}>
        <div className="fc-dialog-actions"><Button variant="quiet" onClick={() => setConfirmation(null)}>Cancel</Button><Button className={confirmation?.danger ? 'fc-danger-action' : undefined} onClick={() => {
          const action = confirmation?.onConfirm;
          setConfirmation(null);
          action?.();
        }}>{confirmation?.confirmLabel ?? 'Confirm'}</Button></div>
      </Dialog>

      <Dialog open={Boolean(folderForm)} onOpenChange={(open) => { if (!open) setFolderForm(null); }} title={folderForm?.mode === 'rename' ? 'Rename folder' : 'Create a folder'} description={folderForm?.mode === 'rename' ? 'Only the name changes. Its parent and nesting stay fixed.' : 'Choose a parent now. Nesting cannot be changed after creation.'}>
        <form className="fc-folder-form" onSubmit={saveFolder}>
          <TextInput id="folder-name" label="Folder name" value={folderName} error={folderError || undefined} onChange={(event) => { setFolderName(event.target.value); setFolderError(''); }} autoComplete="off" dir="auto" required />
          {folderForm?.mode === 'create' && <Select id="folder-parent" label="Parent folder" value={folderParent ?? ''} onChange={(event) => setFolderParent(event.target.value || null)}><option value="">No parent (top level)</option>{library.folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</Select>}
          <div className="fc-dialog-actions"><Button variant="quiet" onClick={() => setFolderForm(null)}>Cancel</Button><Button type="submit">{folderForm?.mode === 'rename' ? 'Save name' : 'Create folder'}</Button></div>
        </form>
      </Dialog>
    </div>
  );
}
