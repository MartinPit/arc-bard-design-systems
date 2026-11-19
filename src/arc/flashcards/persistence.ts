import { createExampleLibrary } from './data';
import type { FlashcardLibrary, PracticeItem, PracticeSession } from './types';

export const LIBRARY_STORAGE_KEY = 'arc-flashcards-library-v1';
export const SESSION_STORAGE_KEY = 'arc-flashcards-session-v1';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === 'string';
}

function validItem(value: unknown): value is PracticeItem {
  if (!record(value)) return false;
  return text(value.key) && text(value.setId) && text(value.cardId) && text(value.setName)
    && Array.isArray(value.front) && value.front.every(text)
    && Array.isArray(value.back) && value.back.every(text);
}

export function validateLibrary(value: unknown): value is FlashcardLibrary {
  if (!record(value) || value.version !== 1 || !Array.isArray(value.sets) || !Array.isArray(value.folders)) return false;
  const ids = new Set<string>();
  for (const folder of value.folders) {
    if (!record(folder) || !text(folder.id) || !text(folder.name) || !(folder.parentId === null || text(folder.parentId))) return false;
    if (ids.has(folder.id)) return false;
    ids.add(folder.id);
  }
  for (const set of value.sets) {
    if (!record(set) || !text(set.id) || !text(set.name) || !text(set.createdAt) || !text(set.updatedAt)
      || !Array.isArray(set.folderIds) || !set.folderIds.every(text)
      || !Array.isArray(set.fields) || !Array.isArray(set.cards)) return false;
    if (ids.has(set.id)) return false;
    ids.add(set.id);
    const fieldIds = new Set<string>();
    const fieldNames = new Set<string>();
    for (const field of set.fields) {
      if (!record(field) || !text(field.id) || !text(field.name) || fieldIds.has(field.id) || fieldNames.has(field.name)) return false;
      fieldIds.add(field.id);
      fieldNames.add(field.name);
    }
    const cardIds = new Set<string>();
    for (const card of set.cards) {
      if (!record(card) || !text(card.id) || cardIds.has(card.id) || !record(card.values)
        || !Object.entries(card.values).every(([fieldId, content]) => fieldIds.has(fieldId) && text(content))) return false;
      cardIds.add(card.id);
    }
  }
  const folderIds = new Set(value.folders.map((folder) => folder.id));
  return value.folders.every((folder) => folder.parentId === null || folderIds.has(folder.parentId))
    && value.sets.every((set) => set.folderIds.every((id: string) => folderIds.has(id)));
}

export function validateSession(value: unknown): value is PracticeSession {
  if (!record(value) || value.version !== 1 || !text(value.id) || !text(value.createdAt) || !text(value.updatedAt)
    || !text(value.title) || !record(value.options) || !record(value.options.scope)
    || !Array.isArray(value.options.frontFields) || !value.options.frontFields.every(text)
    || !Array.isArray(value.options.backFields) || !value.options.backFields.every(text)
    || typeof value.options.shuffle !== 'boolean'
    || (value.options.direction !== undefined && value.options.direction !== 'front-first' && value.options.direction !== 'back-first')) return false;
  const scope = value.options.scope;
  if (!((scope.kind === 'set' && text(scope.setId))
    || (scope.kind === 'folders' && Array.isArray(scope.folderIds) && scope.folderIds.every(text)))) return false;
  if (!['card', 'checkpoint', 'complete'].includes(value.phase as string)) return false;
  for (const key of ['total', 'skipped', 'known', 'repeated', 'currentIndex', 'batchKnown', 'batchRepeated']) {
    if (!Number.isSafeInteger(value[key]) || (value[key] as number) < 0) return false;
  }
  if (!Array.isArray(value.pending) || !value.pending.every(validItem)
    || !Array.isArray(value.carry) || !value.carry.every(validItem)
    || !Array.isArray(value.batch) || value.batch.length > 10 || !value.batch.every(validItem)) return false;
  if (typeof value.revealed !== 'boolean' || typeof value.earlyUnknown !== 'boolean') return false;
  return typeof value.currentIndex === 'number' && value.currentIndex <= value.batch.length;
}

function read(storage: StorageLike | null, key: string) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export interface RecoveredState {
  library: FlashcardLibrary;
  session: PracticeSession | null;
  recovered: boolean;
}

export function loadFlashcardState(storage: StorageLike | null = browserStorage()): RecoveredState {
  const rawLibrary = read(storage, LIBRARY_STORAGE_KEY);
  const rawSession = read(storage, SESSION_STORAGE_KEY);
  const library = rawLibrary === null ? createExampleLibrary() : validateLibrary(rawLibrary) ? rawLibrary : createExampleLibrary();
  const session = rawSession === null || !validateSession(rawSession) ? null : rawSession;
  return {
    library,
    session,
    recovered: rawLibrary === undefined || (rawLibrary !== null && !validateLibrary(rawLibrary))
      || rawSession === undefined || (rawSession !== null && !validateSession(rawSession)),
  };
}

export function saveLibrary(library: FlashcardLibrary, storage: StorageLike | null = browserStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
    return true;
  } catch {
    return false;
  }
}

export function saveSession(session: PracticeSession | null, storage: StorageLike | null = browserStorage()) {
  if (!storage) return false;
  try {
    if (session) storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    else storage.removeItem(SESSION_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearFlashcardStorage(storage: StorageLike | null = browserStorage()) {
  if (!storage) return;
  try {
    storage.removeItem(LIBRARY_STORAGE_KEY);
    storage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // In-memory clearing still works when browser storage is unavailable.
  }
}
