import { createExampleLibrary } from './data';
import type { FlashcardLibrary, PracticeItem, PracticeSession, PracticeSessionState } from './types';

export const LIBRARY_STORAGE_KEY = 'arc-flashcards-library-v1';
export const SESSION_STORAGE_KEY = 'arc-flashcards-session-v1';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === 'string';
}

function nonEmptyText(value: unknown): value is string {
  return text(value) && value.trim().length > 0;
}

function timestamp(value: unknown): value is string {
  return nonEmptyText(value) && Number.isFinite(Date.parse(value));
}

function uniqueStrings(values: string[]) {
  return new Set(values).size === values.length;
}

function validItem(value: unknown): value is PracticeItem {
  if (!record(value)) return false;
  return nonEmptyText(value.key) && nonEmptyText(value.setId) && nonEmptyText(value.cardId) && nonEmptyText(value.setName)
    && Array.isArray(value.front) && value.front.length > 0 && value.front.every(nonEmptyText)
    && Array.isArray(value.back) && value.back.length > 0 && value.back.every(nonEmptyText);
}

export function validateLibrary(value: unknown): value is FlashcardLibrary {
  if (!record(value) || value.version !== 1 || !Array.isArray(value.sets) || !Array.isArray(value.folders)) return false;
  const ids = new Set<string>();
  for (const folder of value.folders) {
    if (!record(folder) || !nonEmptyText(folder.id) || !nonEmptyText(folder.name) || !(folder.parentId === null || nonEmptyText(folder.parentId))) return false;
    if (ids.has(folder.id)) return false;
    ids.add(folder.id);
  }
  for (const set of value.sets) {
    if (!record(set) || !nonEmptyText(set.id) || !nonEmptyText(set.name) || !timestamp(set.createdAt) || !timestamp(set.updatedAt)
      || !Array.isArray(set.folderIds) || !set.folderIds.every(nonEmptyText) || !uniqueStrings(set.folderIds)
      || !Array.isArray(set.fields) || !Array.isArray(set.cards)) return false;
    if (ids.has(set.id)) return false;
    ids.add(set.id);
    const fieldIds = new Set<string>();
    const fieldNames = new Set<string>();
    for (const field of set.fields) {
      if (!record(field) || !nonEmptyText(field.id) || !nonEmptyText(field.name)) return false;
      const normalizedName = field.name.trim().toLocaleLowerCase();
      if (fieldIds.has(field.id) || fieldNames.has(normalizedName)) return false;
      fieldIds.add(field.id);
      fieldNames.add(normalizedName);
    }
    const cardIds = new Set<string>();
    for (const card of set.cards) {
      if (!record(card) || !nonEmptyText(card.id) || cardIds.has(card.id) || !record(card.values)
        || !Object.entries(card.values).every(([fieldId, content]) => fieldIds.has(fieldId) && text(content))
        || Object.values(card.values).filter((content) => text(content) && content.trim().length > 0).length < 2) return false;
      cardIds.add(card.id);
    }
  }
  const folderIds = new Set(value.folders.map((folder) => folder.id));
  const foldersById = new Map(value.folders.map((folder) => [folder.id, folder]));
  const reachable = new Set<string>();
  for (const folder of value.folders) {
    const path = new Set<string>();
    let current: { id: string; parentId: string | null } | undefined = folder;
    while (current?.parentId && !reachable.has(current.id)) {
      if (path.has(current.id)) return false;
      path.add(current.id);
      current = foldersById.get(current.parentId);
    }
    path.forEach((id) => reachable.add(id));
  }
  return value.folders.every((folder) => folder.parentId === null || folderIds.has(folder.parentId))
    && value.sets.every((set) => set.folderIds.every((id: string) => folderIds.has(id)));
}

function validSessionState(value: unknown): value is PracticeSessionState & Record<string, unknown> {
  if (!record(value) || value.version !== 1 || !nonEmptyText(value.id) || !timestamp(value.createdAt) || !timestamp(value.updatedAt)
    || !nonEmptyText(value.title) || !record(value.options) || !record(value.options.scope)
    || !Array.isArray(value.options.frontFields) || !value.options.frontFields.length || !value.options.frontFields.every(nonEmptyText)
    || !Array.isArray(value.options.backFields) || !value.options.backFields.length || !value.options.backFields.every(nonEmptyText)
    || typeof value.options.shuffle !== 'boolean'
    || (value.options.direction !== undefined && value.options.direction !== 'front-first' && value.options.direction !== 'back-first')) return false;
  const backFields = value.options.backFields;
  if (value.options.frontFields.some((field) => backFields.includes(field))) return false;
  const scope = value.options.scope;
  if (!((scope.kind === 'set' && nonEmptyText(scope.setId))
    || (scope.kind === 'folders' && Array.isArray(scope.folderIds) && scope.folderIds.length > 0 && scope.folderIds.every(nonEmptyText) && uniqueStrings(scope.folderIds)))) return false;
  if (!['card', 'checkpoint', 'complete'].includes(value.phase as string)) return false;
  for (const key of ['total', 'skipped', 'known', 'repeated', 'currentIndex', 'batchKnown', 'batchRepeated']) {
    if (!Number.isSafeInteger(value[key]) || (value[key] as number) < 0) return false;
  }
  if (!Array.isArray(value.pending) || !value.pending.every(validItem)
    || !Array.isArray(value.carry) || !value.carry.every(validItem)
    || !Array.isArray(value.batch) || value.batch.length > 10 || !value.batch.every(validItem)) return false;
  if (typeof value.revealed !== 'boolean' || typeof value.earlyUnknown !== 'boolean') return false;

  const total = value.total as number;
  const known = value.known as number;
  const repeated = value.repeated as number;
  const currentIndex = value.currentIndex as number;
  const batchKnown = value.batchKnown as number;
  const batchRepeated = value.batchRepeated as number;
  const { pending, carry, batch, phase } = value;
  const pendingKeys = pending.map((item) => item.key);
  const carryKeys = carry.map((item) => item.key);
  const batchKeys = batch.map((item) => item.key);
  if (!uniqueStrings(pendingKeys) || !uniqueStrings(carryKeys) || !uniqueStrings(batchKeys)
    || pendingKeys.some((key) => carryKeys.includes(key) || batchKeys.includes(key))
    || batchKnown + batchRepeated > batch.length || batchKnown > known || batchRepeated > repeated || known > total
    || total !== known + pending.length + carry.length + batch.length - batchKnown - batchRepeated) return false;

  if (phase === 'card') {
    return batch.length > 0 && currentIndex < batch.length
      && batchKnown + batchRepeated === currentIndex + (value.earlyUnknown ? 1 : 0)
      && (!value.earlyUnknown || value.revealed);
  }
  if (phase === 'checkpoint') {
    return currentIndex === batch.length && !value.revealed && !value.earlyUnknown
      && batchKnown + batchRepeated === batch.length;
  }
  return currentIndex === batch.length && !value.revealed && !value.earlyUnknown
    && known === total && pending.length === 0 && carry.length === 0
    && batchKnown + batchRepeated === batch.length;
}

export function validateSession(value: unknown): value is PracticeSession {
  return validSessionState(value)
    && (value.lastRating === undefined || value.lastRating === null || validSessionState(value.lastRating));
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
