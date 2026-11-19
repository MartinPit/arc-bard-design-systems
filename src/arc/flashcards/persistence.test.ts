import { afterEach, describe, expect, it } from 'vitest';
import { createExampleLibrary } from './data';
import { LIBRARY_STORAGE_KEY, SESSION_STORAGE_KEY, clearFlashcardStorage, loadFlashcardState, saveLibrary, saveSession, validateLibrary, validateSession } from './persistence';
import { createPracticeSession, defaultPracticeOptions } from './practice';

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
  removeItem(key: string) { this.values.delete(key); }
}

const storage = new MemoryStorage();

afterEach(() => {
  clearFlashcardStorage(storage);
  storage.removeItem('unrelated-test-sentinel');
});

describe('versioned Flashcards persistence', () => {
  it('round-trips a valid library and one complete session snapshot', () => {
    const library = createExampleLibrary();
    const options = defaultPracticeOptions(library, { kind: 'set', setId: 'japanese-essentials' });
    const session = createPracticeSession(library, options, '2026-11-19T12:00:00.000Z', () => 0.5);
    session.revealed = true;
    session.known = 3;
    expect(saveLibrary(library, storage)).toBe(true);
    expect(saveSession(session, storage)).toBe(true);
    const restored = loadFlashcardState(storage);
    expect(restored.recovered).toBe(false);
    expect(restored.library).toEqual(library);
    expect(restored.session).toEqual(session);
    expect(restored.session?.revealed).toBe(true);
    expect(restored.session?.options).toEqual(options);
  });

  it('recovers malformed JSON and unsupported versions without throwing', () => {
    storage.setItem(LIBRARY_STORAGE_KEY, '{not json');
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ version: 99 }));
    const recovered = loadFlashcardState(storage);
    expect(recovered.recovered).toBe(true);
    expect(recovered.library.sets.length).toBeGreaterThan(0);
    expect(recovered.session).toBeNull();
  });

  it('rejects broken referential data while keeping an independently valid session', () => {
    const library = createExampleLibrary();
    const session = createPracticeSession(library, defaultPracticeOptions(library, { kind: 'set', setId: 'japanese-essentials' }));
    const invalid = { ...library, sets: [{ ...library.sets[0], folderIds: ['missing-folder'] }] };
    storage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(invalid));
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    expect(validateLibrary(invalid)).toBe(false);
    expect(validateSession(session)).toBe(true);
    const recovered = loadFlashcardState(storage);
    expect(recovered.session).toEqual(session);
    expect(recovered.library.sets.some((set) => set.id === 'japanese-essentials')).toBe(true);
    expect(recovered.recovered).toBe(true);
  });

  it('repairs a corrupted active session only and survives unavailable storage', () => {
    const library = createExampleLibrary();
    saveLibrary(library, storage);
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ version: 1, id: 'broken' }));
    const recovered = loadFlashcardState(storage);
    expect(recovered.library).toEqual(library);
    expect(recovered.session).toBeNull();
    expect(recovered.recovered).toBe(true);
    const throwingStorage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
    expect(() => loadFlashcardState(throwingStorage)).not.toThrow();
    expect(saveLibrary(library, throwingStorage)).toBe(false);
    expect(saveSession(null, throwingStorage)).toBe(false);
    expect(() => clearFlashcardStorage(throwingStorage)).not.toThrow();
  });
});
