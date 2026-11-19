import { useSyncExternalStore } from 'react';
import type { PracticeScope } from './types';

export type FlashcardRoute =
  | { view: 'home'; showAll: boolean; selectedSetId?: string }
  | { view: 'set'; setId: string }
  | { view: 'edit'; setId: string | null }
  | { view: 'folder'; folderId: string }
  | { view: 'setup'; scope: PracticeScope }
  | { view: 'practice' };

function readRoute(url: URL): FlashcardRoute {
  const params = url.searchParams;
  if (params.get('practice') === '1') return { view: 'practice' };
  if (params.get('setup') === '1') {
    const setId = params.get('set');
    if (setId) return { view: 'setup', scope: { kind: 'set', setId } };
    return {
      view: 'setup',
      scope: { kind: 'folders', folderIds: (params.get('folders') ?? '').split(',').filter(Boolean) },
    };
  }
  const folderId = params.get('folder');
  if (folderId) return { view: 'folder', folderId };
  if (params.has('edit')) return { view: 'edit', setId: params.get('edit') === 'new' ? null : params.get('edit') };
  const setId = params.get('set');
  if (setId) return { view: 'set', setId };
  return { view: 'home', showAll: params.get('all') === '1', selectedSetId: params.get('stage') ?? undefined };
}

function routeUrl(route: FlashcardRoute) {
  const url = new URL(window.location.href);
  for (const key of ['all', 'set', 'edit', 'folder', 'setup', 'folders', 'practice', 'stage']) {
    url.searchParams.delete(key);
  }
  if (route.view === 'home') {
    if (route.showAll) url.searchParams.set('all', '1');
    if (route.selectedSetId) url.searchParams.set('stage', route.selectedSetId);
  } else if (route.view === 'set') {
    url.searchParams.set('set', route.setId);
  } else if (route.view === 'edit') {
    url.searchParams.set('edit', route.setId ?? 'new');
  } else if (route.view === 'folder') {
    url.searchParams.set('folder', route.folderId);
  } else if (route.view === 'setup') {
    url.searchParams.set('setup', '1');
    if (route.scope.kind === 'set') url.searchParams.set('set', route.scope.setId);
    else if (route.scope.folderIds.length) url.searchParams.set('folders', route.scope.folderIds.join(','));
  } else {
    url.searchParams.set('practice', '1');
  }
  return url;
}

let snapshot = readRoute(new URL(window.location.href));
const listeners = new Set<() => void>();

function refresh() {
  snapshot = readRoute(new URL(window.location.href));
  listeners.forEach((listener) => listener());
}

window.addEventListener('popstate', refresh);
window.addEventListener('hashchange', refresh);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function navigateUrl(route: FlashcardRoute, method: 'push' | 'replace' = 'push') {
  const url = routeUrl(route);
  if (url.href === window.location.href) return;
  window.history[method === 'push' ? 'pushState' : 'replaceState'](window.history.state, '', url);
  refresh();
}

export function useFlashcardRoute() {
  return useSyncExternalStore(subscribe, () => snapshot);
}

export function getFlashcardUrl(route: FlashcardRoute) {
  const url = routeUrl(route);
  return `${url.pathname}${url.search}${url.hash}`;
}
