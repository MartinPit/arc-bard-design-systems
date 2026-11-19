import { afterEach, describe, expect, it } from 'vitest';
import { createExampleLibrary } from './data';
import { LIBRARY_STORAGE_KEY, SESSION_STORAGE_KEY, clearFlashcardStorage, loadFlashcardState, saveLibrary, saveSession, validateLibrary, validateSession } from './persistence';
import { createPracticeSession, defaultPracticeOptions, reducePractice } from './practice';

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
    let session = createPracticeSession(library, options, '2026-11-19T12:00:00.000Z', () => 0.5);
    session = reducePractice(reducePractice(reducePractice(session, 'reveal'), 'known'), 'known');
    session = reducePractice(reducePractice(session, 'known'), 'reveal');
    expect(saveLibrary(library, storage)).toBe(true);
    expect(saveSession(session, storage)).toBe(true);
    const restored = loadFlashcardState(storage);
    expect(restored.recovered).toBe(false);
    expect(restored.library).toEqual(library);
    expect(restored.session).toEqual(session);
    expect(restored.session?.revealed).toBe(true);
    expect(restored.session?.options).toEqual(options);
  });

  it('accepts legacy sessions and round-trips the latest rating snapshot', () => {
    const library = createExampleLibrary();
    const session = createPracticeSession(library, defaultPracticeOptions(library, { kind: 'set', setId: 'japanese-essentials' }));
    const legacy = { ...session, lastRating: undefined };
    expect(validateSession(legacy)).toBe(true);

    const rated = reducePractice(session, 'unknown');
    expect(saveSession(rated, storage)).toBe(true);
    expect(loadFlashcardState(storage).session).toEqual(rated);
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

  it('rejects cyclic folders, invalid dates, ambiguous field names, and incomplete saved cards', () => {
    const library = createExampleLibrary();
    const cyclic = structuredClone(library);
    cyclic.folders.find((folder) => folder.id === 'languages')!.parentId = 'jlpt';
    expect(validateLibrary(cyclic)).toBe(false);

    const invalidDate = structuredClone(library);
    invalidDate.sets[0].createdAt = 'not-a-date';
    expect(validateLibrary(invalidDate)).toBe(false);

    const ambiguousFields = structuredClone(library);
    ambiguousFields.sets[0].fields[1].name = ` ${ambiguousFields.sets[0].fields[0].name.toLocaleUpperCase()} `;
    expect(validateLibrary(ambiguousFields)).toBe(false);

    const incompleteCard = structuredClone(library);
    const twoFieldSet = incompleteCard.sets.find((set) => set.id === 'human-anatomy')!;
    twoFieldSet.cards[0].values[twoFieldSet.fields[1].id] = '';
    expect(validateLibrary(incompleteCard)).toBe(false);
  });

  it('rejects internally inconsistent or ambiguous practice snapshots', () => {
    const library = createExampleLibrary();
    const session = createPracticeSession(library, defaultPracticeOptions(library, { kind: 'set', setId: 'japanese-essentials' }));
    expect(validateSession({ ...session, createdAt: 'invalid' })).toBe(false);
    expect(validateSession({ ...session, known: session.total + 1 })).toBe(false);
    expect(validateSession({ ...session, currentIndex: session.batch.length })).toBe(false);
    expect(validateSession({ ...session, pending: [session.pending[0], session.pending[0]] })).toBe(false);
    expect(validateSession({ ...session, options: { ...session.options, backFields: session.options.frontFields } })).toBe(false);
    expect(validateSession(session)).toBe(true);
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
