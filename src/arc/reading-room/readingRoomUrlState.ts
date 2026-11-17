import { useSyncExternalStore } from 'react';
import { initialBooks } from './data';

export type View = 'today' | 'library' | 'notes';
export type LibraryFilter = 'all' | 'reading' | 'unread' | 'finished' | 'saved';

const validViews = new Set<View>(['today', 'library', 'notes']);
const validFilters = new Set<LibraryFilter>(['all', 'reading', 'unread', 'finished', 'saved']);
const validBookIds = new Set(initialBooks.map((book) => book.id));

interface ReadingRoomUrlState {
  view: View;
  search: string;
  filter: LibraryFilter;
  selectedBookId: string | null;
}

function readUrl(url: URL): ReadingRoomUrlState {
  const requestedView = url.searchParams.get('view') as View | null;
  const requestedFilter = url.searchParams.get('status') as LibraryFilter | null;
  const requestedBookId = url.searchParams.get('book');
  return {
    view: requestedView && validViews.has(requestedView) ? requestedView : 'today',
    search: url.searchParams.get('q') || '',
    filter: requestedFilter && validFilters.has(requestedFilter) ? requestedFilter : 'all',
    selectedBookId: requestedBookId && validBookIds.has(requestedBookId) ? requestedBookId : null,
  };
}

let snapshot = readUrl(new URL(window.location.href));
const listeners = new Set<() => void>();

function refresh() {
  snapshot = readUrl(new URL(window.location.href));
  listeners.forEach((listener) => listener());
}

window.addEventListener('popstate', refresh);
window.addEventListener('hashchange', refresh);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writeView(url: URL, view: View) {
  if (view === 'today') url.searchParams.delete('view');
  else url.searchParams.set('view', view);
}

function writeSearch(url: URL, search: string) {
  if (search) url.searchParams.set('q', search);
  else url.searchParams.delete('q');
}

function writeFilter(url: URL, filter: LibraryFilter) {
  if (filter === 'all') url.searchParams.delete('status');
  else url.searchParams.set('status', filter);
}

function updateUrl(update: (url: URL) => void, method: 'push' | 'replace') {
  const url = new URL(window.location.href);
  update(url);
  if (url.href === window.location.href) return;
  if (method === 'push') window.history.pushState(window.history.state, '', url);
  else window.history.replaceState(window.history.state, '', url);
  refresh();
}

export function useReadingRoomUrlState() {
  const state = useSyncExternalStore(subscribe, () => snapshot);

  function setView(view: View) {
    updateUrl((url) => writeView(url, view), 'push');
  }

  function setSearch(search: string) {
    updateUrl((url) => writeSearch(url, search), 'replace');
  }

  function setFilter(filter: LibraryFilter) {
    updateUrl((url) => writeFilter(url, filter), 'push');
  }

  function clearCatalogue() {
    updateUrl((url) => {
      writeSearch(url, '');
      writeFilter(url, 'all');
    }, 'push');
  }

  function setSelectedBookId(bookId: string | null) {
    updateUrl((url) => {
      if (bookId && validBookIds.has(bookId)) url.searchParams.set('book', bookId);
      else url.searchParams.delete('book');
    }, 'push');
  }

  function getViewUrl(view: View) {
    const url = new URL(window.location.href);
    writeView(url, view);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  return { ...state, setView, setSearch, setFilter, clearCatalogue, setSelectedBookId, getViewUrl };
}
