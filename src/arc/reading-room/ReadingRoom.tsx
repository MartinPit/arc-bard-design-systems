import { useEffect, useMemo, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { ArrowRight, BookOpen, Bookmark, CalendarDays, Check, Clock3, Feather, LibraryBig, NotebookPen, Plus, Search, Sparkles, SunMedium, X } from 'lucide-react';
import { Button, Dialog, IconButton, Select, Textarea, TextInput, Toast, ToastRegion } from '../components';
import { ThemeToggle } from '../components/ThemeToggle';
import { ProtectedText } from '../components/ProtectedText';
import { useArcTheme } from '../theme';
import { formatDate, formatLedgerNumber, formatNumber, formatRelativeTime, formatTime, formatUnit, formatYear } from '../intl';
import { BookCover } from './BookCover';
import { initialBooks, initialNotes, type Book, type ReadingNote } from './data';
import { useReadingRoomUrlState, type LibraryFilter, type View } from './readingRoomUrlState';
import './reading-room.css';
type ToastState = { id: number; title: string; message: string; tone?: 'success' | 'info' | 'danger' };

const navigation: { id: View; label: string; index: number; icon: typeof SunMedium }[] = [
  { id: 'today', label: 'Today', index: 1, icon: SunMedium },
  { id: 'library', label: 'Library', index: 2, icon: LibraryBig },
  { id: 'notes', label: 'Notes', index: 3, icon: NotebookPen },
];

const editionNumber = 26;
const editionYear = 2026;

const editionDate = '2026-11-16T12:00:00';
const readingCircleAt = '2026-11-19T19:30:00';
const readingCircleTeaAt = '2026-11-19T19:00:00';

const filters: { value: LibraryFilter; label: string }[] = [
  { value: 'all', label: 'All books' },
  { value: 'reading', label: 'Currently reading' },
  { value: 'unread', label: 'Not started' },
  { value: 'finished', label: 'Finished' },
  { value: 'saved', label: 'Saved' },
];

function followInternalLink(event: MouseEvent<HTMLAnchorElement>, navigate: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate();
}

function ArcLeafMark() {
  return (
    <svg className="arc-reading-room__mark" viewBox="0 0 40 44" aria-hidden="true">
      <path d="M20 39C6 31 5 15 17 4c9 10 11 23 3 35Z" fill="var(--arc-marigold)" stroke="currentColor" />
      <path d="M21 39C34 34 38 23 33 12c-9 5-15 15-12 27Z" fill="var(--arc-magenta)" stroke="currentColor" />
      <path d="M13 13c7 11 7 20 8 29M31 19l-9 20" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function SectionLabel({ number, children }: { number: string | number; children: ReactNode }) {
  return <p className="arc-reading-room__section-label"><span>{typeof number === 'number' ? formatLedgerNumber(number) : number}</span>{children}</p>;
}

function formatChapter(book: Book) {
  return `${formatLedgerNumber(book.chapterNumber)} — ${book.chapterTitle}`;
}

function NoteMetadata({ note }: { note: ReadingNote }) {
  return (
    <>
      <time dateTime={note.createdAt}>{note.personal ? formatRelativeTime(note.createdAt) : formatDate(note.createdAt, { day: '2-digit', month: 'short' })}</time>
      {note.page !== undefined && <> · p. {formatNumber(note.page)}</>}
      {note.completed && ' · finished'}
      {note.personal && ' · personal note'}
    </>
  );
}

interface BookCardProps {
  book: Book;
  onOpen: (book: Book) => void;
  onSave: (id: string) => void;
}

function BookCard({ book, onOpen, onSave }: BookCardProps) {
  const progressLabel = book.progress === 100 ? 'Finished' : book.progress === 0 ? 'Not started' : `${formatUnit(book.progress, '%')} read`;
  return (
    <article className="arc-reading-room-book-card">
      <div className="arc-reading-room-book-card__cover-wrap">
        <button type="button" className="arc-reading-room-book-card__cover-button" onClick={() => onOpen(book)} aria-label={`Open ${book.title}`}>
          <BookCover book={book} />
        </button>
        <IconButton
          className={`arc-reading-room-book-card__save${book.saved ? ' is-saved' : ''}`}
          variant="quiet"
          label={book.saved ? `Remove ${book.title} from saved books` : `Save ${book.title}`}
          aria-pressed={book.saved}
          onClick={() => onSave(book.id)}
        >
          <Bookmark size={17} fill={book.saved ? 'currentColor' : 'none'} aria-hidden="true" />
        </IconButton>
      </div>
      <div className="arc-reading-room-book-card__meta">
        <p className="arc-reading-room-book-card__category">{book.category}</p>
        <h3><button type="button" onClick={() => onOpen(book)}>{book.title}</button></h3>
        <p className="arc-reading-room-book-card__author">{book.author}</p>
        <div className="arc-reading-room-book-card__progress-label"><span>{progressLabel}</span><span>{book.minutesLeft > 0 ? formatUnit(book.minutesLeft, 'min') : 'Complete'}</span></div>
        <progress className="arc-reading-room-progress" max="100" value={book.progress} aria-label={`Reading progress for ${book.title}`} />
      </div>
    </article>
  );
}

function EmptyLibrary({ onClear }: { onClear: () => void }) {
  return (
    <div className="arc-reading-room__empty">
      <Feather size={34} strokeWidth={1.3} aria-hidden="true" />
      <p className="arc-reading-room__folio">NO. {formatNumber(0, { minimumIntegerDigits: 3, useGrouping: false })}</p>
      <h2>No Books in This Corner</h2>
      <p>Try another title or author, or clear the filters to bring the whole collection back.</p>
      <Button variant="secondary" onClick={onClear}><X size={16} aria-hidden="true" />Clear Search and Filters</Button>
    </div>
  );
}

export function ReadingRoom() {
  const { theme, toggleTheme } = useArcTheme();
  const {
    view, search, filter, selectedBookId, setView, setSearch, setFilter, clearCatalogue, setSelectedBookId, getViewUrl,
  } = useReadingRoomUrlState();
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [notes, setNotes] = useState<ReadingNote[]>(initialNotes);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [draftNote, setDraftNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [draftBookId, setDraftBookId] = useState(initialBooks[0].id);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!draftNote) return;
    function warnAboutDraft(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = true;
    }
    window.addEventListener('beforeunload', warnAboutDraft);
    return () => window.removeEventListener('beforeunload', warnAboutDraft);
  }, [draftNote]);

  const selectedBook = books.find((book) => book.id === selectedBookId) ?? null;
  const continueBook = books[0];
  const readingCount = books.filter((book) => book.progress > 0 && book.progress < 100).length;
  const noteCount = notes.length;

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return books.filter((book) => {
      const matchesSearch = !query || `${book.title} ${book.author}`.toLocaleLowerCase().includes(query);
      const matchesFilter = filter === 'all'
        || (filter === 'saved' && book.saved)
        || (filter === 'reading' && book.progress > 0 && book.progress < 100)
        || (filter === 'unread' && book.progress === 0)
        || (filter === 'finished' && book.progress === 100);
      return matchesSearch && matchesFilter;
    });
  }, [books, filter, search]);

  function announce(title: string, message: string, tone: ToastState['tone'] = 'success') {
    setToast({ id: Date.now(), title, message, tone });
  }

  function openBook(book: Book) {
    setSelectedBookId(book.id);
  }

  function toggleSaved(id: string) {
    const book = books.find((item) => item.id === id);
    if (!book) return;
    setBooks((current) => current.map((item) => item.id === id ? { ...item, saved: !item.saved } : item));
    announce(book.saved ? 'You Removed a Saved Book' : 'You Saved a Book for Later', book.saved ? `${book.title} remains in your library.` : `You saved ${book.title} to your shelf.`, 'info');
  }

  function markChapterRead() {
    if (!selectedBook) return;
    const nextProgress = Math.min(100, selectedBook.progress + 17);
    setBooks((current) => current.map((book) => book.id === selectedBook.id
      ? { ...book, progress: nextProgress, minutesLeft: nextProgress === 100 ? 0 : Math.max(3, book.minutesLeft - 4) }
      : book));
    setSelectedBookId(null);
    announce(nextProgress === 100 ? 'You Finished the Book' : 'You Marked a Chapter Read', nextProgress === 100
      ? `You closed the final page of ${selectedBook.title}.`
      : `You read ${formatUnit(nextProgress, '%')} of ${selectedBook.title}. Your place stays on this device.`);
  }

  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draftNote.trim();
    if (!text) {
      setNoteError('Enter a note before saving.');
      const textarea = event.currentTarget.elements.namedItem('note');
      if (textarea instanceof HTMLTextAreaElement) textarea.focus();
      return;
    }
    const book = books.find((item) => item.id === draftBookId) ?? books[0];
    setNotes((current) => [{ id: Date.now(), bookId: book.id, text, createdAt: new Date().toISOString(), personal: true }, ...current]);
    setDraftNote('');
    setNoteError('');
    setNoteDialogOpen(false);
    announce('You Pressed a Note into the Margin', `You saved your thought on ${book.title} on this device.`);
  }

  const readerFooter = selectedBook ? (
    <Button onClick={markChapterRead} disabled={selectedBook.progress === 100}>
      <Check size={17} aria-hidden="true" />{selectedBook.progress === 100 ? 'Book Completed' : 'Mark Chapter Read'}
    </Button>
  ) : null;

  return (
    <div className="arc-root arc-reading-room" data-reading-room="arc">
      <a className="arc-skip-link" href="#reading-room-main">Skip to reading room</a>
      <header className="arc-reading-room__masthead">
        <div className="arc-reading-room__identity">
          <ArcLeafMark />
          <div><span className="arc-reading-room__wordmark notranslate" translate="no" data-protected-text>Arc Reading Room</span><span className="arc-reading-room__tagline">A Quieter Place to Read</span></div>
        </div>
        <div className="arc-reading-room__masthead-meta"><span>Private edition · No. {formatLedgerNumber(editionNumber)}</span><span>Made for slow afternoons</span></div>
        <div className="arc-reading-room__masthead-actions">
          <a className="arc-reading-room__system-link" href={`${import.meta.env.BASE_URL}arc/`}><ProtectedText>Arc</ProtectedText> design system<span aria-hidden="true">↗</span></a>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <div className="arc-reading-room__shell">
        <aside className="arc-reading-room__rail">
          <nav className="arc-reading-room__nav" aria-label="Reading room sections">
            <p className="arc-reading-room__rail-label">Your reading desk</p>
            {navigation.map(({ id, label, index, icon: Icon }) => (
              <a key={id} href={getViewUrl(id)} aria-label={label} aria-current={view === id ? 'page' : undefined} onClick={(event) => followInternalLink(event, () => setView(id))}>
                <span className="arc-reading-room__nav-index">{formatLedgerNumber(index)}</span><Icon size={18} strokeWidth={1.65} aria-hidden="true" /><span>{label}</span>
                {id === 'notes' && <span className="arc-reading-room__nav-count" aria-label={`${formatNumber(noteCount)} notes`}>{formatNumber(noteCount)}</span>}
              </a>
            ))}
          </nav>
          <div className="arc-reading-room__rail-bottom">
            <div className="arc-reading-room__quiet-stats">
              <p className="arc-reading-room__rail-label">A gentle ledger</p>
              <dl><div><dt>Books in motion</dt><dd>{formatLedgerNumber(readingCount)}</dd></div><div><dt>Marginalia kept</dt><dd>{formatLedgerNumber(noteCount)}</dd></div></dl>
            </div>
            <div className="arc-reading-room__member-note">
              <ArcLeafMark />
              <p>“Attention is the rarest and purest form of generosity.”</p>
              <span>Your member commonplace · {formatYear(editionYear)}</span>
            </div>
          </div>
        </aside>

        <main id="reading-room-main" className="arc-reading-room__main" tabIndex={-1}>
          {view === 'today' && (
            <>
              <header className="arc-reading-room__page-header">
                <div><p className="arc-reading-room__eyebrow">{formatDate(editionDate, { weekday: 'long' })}’s edition · <time dateTime={editionDate}>{formatDate(editionDate, { day: 'numeric', month: 'long' })}</time></p><h1>Make Room<br />for a <em>Story.</em></h1></div>
                <div className="arc-reading-room__page-intro"><span className="arc-reading-room__folio">FOLIO {formatLedgerNumber(1)}</span><p>A small shelf, a comfortable chair, and nothing asking to be done quickly. Welcome back to your reading room.</p></div>
              </header>

              <section className="arc-reading-room-feature" aria-labelledby="continue-heading">
                <div className="arc-reading-room-feature__art"><span className="arc-reading-room-feature__plate"><ProtectedText>ARC</ProtectedText> / CURRENT VOLUME</span><BookCover book={continueBook} /><span className="arc-reading-room-feature__edition">First room edition<br />Autumn · {formatYear(editionYear)}</span></div>
                <div className="arc-reading-room-feature__copy">
                  <p className="arc-reading-room-feature__eyebrow"><BookOpen size={16} aria-hidden="true" />Continue Reading {continueBook.title}</p>
                  <span className="arc-reading-room-feature__chapter">{formatChapter(continueBook)}</span>
                  <h2 id="continue-heading">{continueBook.title}</h2>
                  <p className="arc-reading-room-feature__author">Written by {continueBook.author}</p>
                  <blockquote>“Some places are found by staying long enough to notice them.”</blockquote>
                  <div className="arc-reading-room-feature__reading-meta"><span>{formatUnit(continueBook.progress, '%')} through the volume</span><span><Clock3 size={14} aria-hidden="true" />{formatUnit(continueBook.minutesLeft, 'min')} left in chapter</span></div>
                  <progress className="arc-reading-room-progress arc-reading-room-progress--feature" max="100" value={continueBook.progress} aria-label={`Reading progress for ${continueBook.title}`} />
                  <div className="arc-reading-room-feature__actions"><Button onClick={() => openBook(continueBook)}>Continue Reading {continueBook.title}<ArrowRight size={17} aria-hidden="true" /></Button><button type="button" className="arc-reading-room-feature__save" aria-pressed={continueBook.saved} onClick={() => toggleSaved(continueBook.id)}><Bookmark size={16} fill={continueBook.saved ? 'currentColor' : 'none'} aria-hidden="true" />{continueBook.saved ? 'Saved to Your Shelf' : 'Save for Later'}</button></div>
                </div>
              </section>

              <div className="arc-reading-room__today-grid">
                <section className="arc-reading-room__shelf" aria-labelledby="shelf-heading">
                  <div className="arc-reading-room__section-heading"><SectionLabel number={2}>Curated by your shelf</SectionLabel><span className="arc-reading-room__folio">{formatNumber(books.length)} VOLUMES</span></div>
                  <div className="arc-reading-room__section-title-row"><h2 id="shelf-heading">A Little of Everything.</h2><a className="arc-reading-room__text-button" href={getViewUrl('library')} onClick={(event) => followInternalLink(event, () => setView('library'))}>Browse Library<ArrowRight size={15} aria-hidden="true" /></a></div>
                  <div className="arc-reading-room__book-grid arc-reading-room__book-grid--shelf">
                    {[books[1], books[4], books[2]].map((book) => <BookCard key={book.id} book={book} onOpen={openBook} onSave={toggleSaved} />)}
                  </div>
                </section>

                <aside className="arc-reading-room__companion" aria-label="Reading circle and recent note">
                  <section className="arc-reading-room-club">
                    <SectionLabel number={3}>The Reading Circle</SectionLabel>
                    <CalendarDays size={27} strokeWidth={1.25} aria-hidden="true" />
                    <time className="arc-reading-room-club__date" dateTime={readingCircleAt}><span>{formatDate(readingCircleAt, { month: 'short' })}</span><strong>{formatDate(readingCircleAt, { day: 'numeric' })}</strong><span>{formatDate(readingCircleAt, { weekday: 'short' })} · {formatTime(readingCircleAt)}</span></time>
                    <h2>On Paying Attention</h2><p>A quiet conversation about Rowan Vale’s essays. {formatNumber(12)} chairs, tea at <time dateTime={readingCircleTeaAt}>{formatTime(readingCircleTeaAt)}</time>.</p>
                    <div className="arc-reading-room-club__attending"><span className="arc-reading-room-club__avatars" aria-hidden="true"><i>MS</i><i>IW</i><i>EN</i></span><span>You’re on the list</span><Check size={16} aria-hidden="true" /></div>
                  </section>
                  <section className="arc-reading-room-recent-note">
                    <div className="arc-reading-room__section-heading"><SectionLabel number={4}>From the Margins</SectionLabel><Feather size={18} aria-hidden="true" /></div>
                    <blockquote>{notes[0]?.text ?? 'Your next observation can live here.'}</blockquote><p>{notes[0] ? <NoteMetadata note={notes[0]} /> : 'A fresh page'}</p>
                    <a className="arc-reading-room__text-button" href={getViewUrl('notes')} onClick={(event) => followInternalLink(event, () => setView('notes'))}>Open Commonplace Book<ArrowRight size={15} aria-hidden="true" /></a>
                  </section>
                </aside>
              </div>
            </>
          )}

          {view === 'library' && (
            <>
              <header className="arc-reading-room__page-header arc-reading-room__page-header--compact">
                <div><p className="arc-reading-room__eyebrow">Your collection · {formatNumber(books.length)} original volumes</p><h1>The <em>Library.</em></h1></div>
                <div className="arc-reading-room__page-intro"><span className="arc-reading-room__folio">CATALOGUE {formatLedgerNumber(2)}</span><p>Stories in progress, poems to return to, and unopened doors. Find your next quiet place.</p></div>
              </header>
              <section aria-labelledby="catalogue-heading">
                <h2 id="catalogue-heading" className="arc-reading-room__visually-hidden">Library Catalogue</h2>
                <form className="arc-reading-room-library-tools" role="search" onSubmit={(event) => event.preventDefault()}>
                  <TextInput type="search" name="library-search" autoComplete="off" label="Search your library" placeholder="Title or author…" value={search} onChange={(event) => setSearch(event.target.value)} />
                  <Select label="Filter by reading status" name="reading-status" autoComplete="off" value={filter} onChange={(event) => setFilter(event.target.value as LibraryFilter)}>{filters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
                  <div className="arc-reading-room-library-tools__count" aria-live="polite"><Search size={17} aria-hidden="true" /><span>{formatNumber(filteredBooks.length)} {filteredBooks.length === 1 ? 'volume' : 'volumes'} found</span></div>
                </form>
                {filteredBooks.length > 0 ? <div className="arc-reading-room__book-grid arc-reading-room__book-grid--library">{filteredBooks.map((book) => <BookCard key={book.id} book={book} onOpen={openBook} onSave={toggleSaved} />)}</div> : <EmptyLibrary onClear={clearCatalogue} />}
              </section>
            </>
          )}

          {view === 'notes' && (
            <>
              <header className="arc-reading-room__page-header arc-reading-room__page-header--compact">
                <div><p className="arc-reading-room__eyebrow">Your commonplace book · {formatNumber(notes.length)} entries</p><h1>From the <em>Margins.</em></h1></div>
                <div className="arc-reading-room__page-intro"><span className="arc-reading-room__folio">LEDGER {formatLedgerNumber(3)}</span><p>Loose thoughts, underlined sentences, and the ideas that stayed with you after you closed the book.</p><Button onClick={() => setNoteDialogOpen(true)}><Plus size={17} aria-hidden="true" />Add a Note</Button></div>
              </header>
              <section className={`arc-reading-room-notes${notes.length > 50 ? ' arc-reading-room-notes--large' : ''}`} aria-labelledby="notes-heading">
                <div className="arc-reading-room__section-heading"><SectionLabel number="A—Z">Entries in Order of Noticing</SectionLabel><NotebookPen size={21} strokeWidth={1.4} aria-hidden="true" /></div>
                <h2 id="notes-heading" className="arc-reading-room__visually-hidden">Reading Notes</h2>
                {notes.map((note, index) => {
                  const book = books.find((item) => item.id === note.bookId);
                  return <article className="arc-reading-room-note" key={note.id}><div className="arc-reading-room-note__number">{formatLedgerNumber(index + 1)}</div><div className="arc-reading-room-note__body"><p className="arc-reading-room-note__book">{book?.title ?? 'Unbound thought'}</p><blockquote>{note.text}</blockquote><p className="arc-reading-room-note__date"><NoteMetadata note={note} /> · {book?.author}</p></div><Feather size={20} strokeWidth={1.2} aria-hidden="true" /></article>;
                })}
                <div className="arc-reading-room-notes__colophon"><ArcLeafMark /><p>Keep what moves you.<br /><span>Leave the rest lightly.</span></p></div>
              </section>
            </>
          )}

          <footer className="arc-reading-room__footer"><span><ProtectedText>ARC READING ROOM</ProtectedText></span><p>A Private Place for Public Stories.</p><span>EST. {formatYear(editionYear)} · FOLIO {formatLedgerNumber(navigation.find((item) => item.id === view)?.index ?? 1)}</span></footer>
        </main>
      </div>

      <Dialog open={Boolean(selectedBook)} onOpenChange={(open) => { if (!open) setSelectedBookId(null); }} title={selectedBook?.title ?? 'Reader'} description={selectedBook ? `${selectedBook.author} · ${formatChapter(selectedBook)}` : undefined} footer={readerFooter}>
        {selectedBook && <div className="arc-reading-room-reader"><div className="arc-reading-room-reader__opening" aria-hidden="true"><Sparkles size={25} strokeWidth={1.2} /><span><ProtectedText>ARC</ProtectedText> / ORIGINAL FICTION & ESSAYS</span><span>{formatUnit(selectedBook.progress, '%')}</span></div><p className="arc-reading-room-reader__dropcap">{selectedBook.excerpt[0]}</p>{selectedBook.excerpt.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="arc-reading-room-reader__end"><span>❧</span><span>You keep your progress on this device for this visit.</span></div></div>}
      </Dialog>

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} title="Press a Thought into the Margin" description="Add a short personal note. It will appear at the top of your commonplace book.">
        <form className="arc-reading-room-note-form" onSubmit={addNote}>
          <Select label="Book" name="note-book" autoComplete="off" value={draftBookId} onChange={(event) => setDraftBookId(event.target.value)}>{books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}</Select>
          <Textarea label="Your note" name="note" autoComplete="off" required maxLength={320} rows={5} value={draftNote} error={noteError || undefined} onChange={(event) => { setDraftNote(event.target.value); setNoteError(''); }} placeholder="A line about light gathering the room…" hint={`${formatNumber(draftNote.length)}/${formatNumber(320)} characters · you keep your note on this device for this visit`} />
          <div className="arc-reading-room-note-form__actions"><Button variant="quiet" onClick={() => setNoteDialogOpen(false)}>Cancel</Button><Button type="submit"><Feather size={16} aria-hidden="true" />Save Note</Button></div>
        </form>
      </Dialog>

      {toast && <ToastRegion><Toast key={toast.id} title={toast.title} message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /></ToastRegion>}
    </div>
  );
}
