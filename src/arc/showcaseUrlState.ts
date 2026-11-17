import { useSyncExternalStore } from 'react';

const validTabs = new Set(['overview', 'notes', 'history']);
const validSources = new Set([
  'button', 'icon-button', 'text-input', 'textarea', 'select', 'checkbox',
  'radio-group', 'switch', 'slider', 'tabs', 'dialog', 'popover', 'tooltip',
  'toast', 'badge', 'avatar', 'card', 'table', 'pagination',
]);
export function getSpecimenSourceId(title: string) {
  return title.toLowerCase().replaceAll(' ', '-');
}

const defaultPage = 3;
const totalPages = 8;

export interface ShowcaseUrlState {
  tab: string;
  sources: string[];
  query: string;
  ascending: boolean;
  page: number;
}

function readUrl(url: URL): ShowcaseUrlState {
  const requestedTab = url.searchParams.get('tab') || '';
  const requestedPage = url.searchParams.get('page');
  const numericPage = requestedPage && /^-?\d+$/.test(requestedPage) ? Number(requestedPage) : defaultPage;
  return {
    tab: validTabs.has(requestedTab) ? requestedTab : 'overview',
    sources: [...new Set(url.searchParams.getAll('source').filter((source) => validSources.has(source)))],
    query: url.searchParams.get('q') || '',
    ascending: url.searchParams.get('sort') !== 'desc',
    page: Math.min(totalPages, Math.max(1, numericPage)),
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

function updateUrl(update: (url: URL) => void, method: 'push' | 'replace') {
  const url = new URL(window.location.href);
  update(url);
  if (url.href === window.location.href) return;
  if (method === 'push') window.history.pushState(window.history.state, '', url);
  else window.history.replaceState(window.history.state, '', url);
  refresh();
}

function writePage(url: URL, page: number) {
  if (page === defaultPage) url.searchParams.delete('page');
  else url.searchParams.set('page', String(Math.min(totalPages, Math.max(1, page))));
}

export function useShowcaseUrlState() {
  const state = useSyncExternalStore(subscribe, () => snapshot);

  function setTab(tab: string) {
    updateUrl((url) => {
      if (validTabs.has(tab) && tab !== 'overview') url.searchParams.set('tab', tab);
      else url.searchParams.delete('tab');
    }, 'push');
  }

  function setSourceOpen(source: string, open: boolean) {
    updateUrl((url) => {
      const sources = readUrl(url).sources.filter((item) => item !== source);
      if (open && validSources.has(source)) sources.push(source);
      url.searchParams.delete('source');
      sources.forEach((item) => url.searchParams.append('source', item));
    }, 'push');
  }

  function setQuery(query: string, method: 'push' | 'replace' = 'replace') {
    updateUrl((url) => {
      if (query) url.searchParams.set('q', query);
      else url.searchParams.delete('q');
    }, method);
  }

  function setAscending(ascending: boolean) {
    updateUrl((url) => {
      if (ascending) url.searchParams.delete('sort');
      else url.searchParams.set('sort', 'desc');
    }, 'push');
  }

  function setPage(page: number) {
    updateUrl((url) => writePage(url, page), 'push');
  }

  function getPageUrl(page: number) {
    const url = new URL(window.location.href);
    writePage(url, page);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  return { ...state, setTab, setSourceOpen, setQuery, setAscending, setPage, getPageUrl };
}
