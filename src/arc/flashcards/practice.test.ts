import { describe, expect, it } from 'vitest';
import { createExampleLibrary } from './data';
import { createPracticeSession, defaultPracticeOptions, practiceEligibility, reducePractice, scopedSets } from './practice';
import type { FlashcardLibrary, FlashcardSet, PracticeOptions, PracticeSession } from './types';

const NOW = '2026-11-19T12:00:00.000Z';

function set(id: string, createdAt: string, folderIds: string[], cards: Array<Record<string, string>>, names = ['Front', 'Back']): FlashcardSet {
  return {
    id,
    name: id,
    createdAt,
    updatedAt: createdAt,
    folderIds,
    fields: names.map((name, index) => ({ id: `${id}-f${index}`, name })),
    cards: cards.map((values, index) => ({
      id: `${id}-c${index}`,
      values: Object.fromEntries(names.map((_, fieldIndex) => [`${id}-f${fieldIndex}`, values[`f${fieldIndex}`] ?? ''])),
    })),
  };
}

function fixture(): FlashcardLibrary {
  return {
    version: 1,
    folders: [
      { id: 'parent', name: 'Parent', parentId: null },
      { id: 'child', name: 'Child', parentId: 'parent' },
      { id: 'other', name: 'Other', parentId: null },
    ],
    sets: [
      set('newest', '2026-11-18T00:00:00.000Z', ['parent', 'child'], [
        { f0: 'A front', f1: 'A back', f2: 'A extra' },
        { f0: 'Incomplete', f1: '', f2: 'Extra only' },
        { f0: 'B front', f1: 'B back' },
      ], ['Front', 'Back', 'Extra']),
      set('older', '2026-11-01T00:00:00.000Z', ['child'], [
        { f0: 'C front', f1: 'C back' },
      ]),
      set('outside', '2026-11-19T00:00:00.000Z', ['other'], [{ f0: 'Outside', f1: 'No scope' }]),
    ],
  };
}

function options(overrides: Partial<PracticeOptions> = {}): PracticeOptions {
  return {
    scope: { kind: 'folders', folderIds: ['parent', 'child'] },
    frontFields: ['Front'],
    backFields: ['Back'],
    shuffle: false,
    ...overrides,
  };
}

function finishedBatch(session: PracticeSession, knowAll = true) {
  let current = session;
  while (current.phase === 'card') {
    if (!knowAll && current.currentIndex === 0) current = reducePractice(reducePractice(current, 'reveal', NOW), 'unknown', NOW);
    else current = reducePractice(current, 'known', NOW);
  }
  return current;
}

describe('practice scope and eligibility', () => {
  it('includes descendants, de-duplicates multiply filed sets, and sorts newest first without shuffle', () => {
    const library = fixture();
    expect(scopedSets(library, options().scope).map((item) => item.id)).toEqual(['newest', 'older']);
    const { eligible, skipped } = practiceEligibility(library, options());
    expect(eligible.map((item) => item.cardId)).toEqual(['newest-c0', 'newest-c2', 'older-c0']);
    expect(skipped).toBe(1);
    expect(new Set(eligible.map((item) => item.key)).size).toBe(eligible.length);
  });

  it('requires every selected multi-field value and preserves their unlabelled value order', () => {
    const { eligible, skipped } = practiceEligibility(fixture(), options({ frontFields: ['Front', 'Extra'], backFields: ['Back'] }));
    expect(eligible.map((item) => item.cardId)).toEqual(['newest-c0']);
    expect(eligible[0].front).toEqual(['A front', 'A extra']);
    expect(eligible[0].back).toEqual(['A back']);
    expect(skipped).toBe(3);
  });

  it('applies front-first/back-first per set even when two-set vocabularies have different names', () => {
    const library = fixture();
    library.sets = [
      set('english', '2026-11-18T00:00:00.000Z', ['parent'], [{ f0: 'hello', f1: 'bonjour' }], ['English', 'French']),
      set('anatomy', '2026-11-17T00:00:00.000Z', ['child'], [{ f0: 'femur', f1: 'thigh bone' }], ['Structure', 'Description']),
    ];
    const configured = defaultPracticeOptions(library, { kind: 'folders', folderIds: ['parent'] });
    expect(configured.direction).toBe('front-first');
    const forward = practiceEligibility(library, configured).eligible;
    expect(forward.map((item) => item.front[0])).toEqual(['hello', 'femur']);
    const reverse = practiceEligibility(library, { ...configured, direction: 'back-first' }).eligible;
    expect(reverse.map((item) => item.front[0])).toEqual(['bonjour', 'thigh bone']);
  });

  it('uses an injectable deterministic shuffle without mutating editor arrays', () => {
    const library = fixture();
    const original = library.sets[0].cards.map((card) => card.id);
    const unshuffled = practiceEligibility(library, options()).eligible.map((item) => item.key);
    const session = createPracticeSession(library, options({ shuffle: true }), NOW, () => 0);
    const shuffled = [...session.batch, ...session.pending].map((item) => item.key);
    expect(shuffled).not.toEqual(unshuffled);
    expect(new Set(shuffled)).toEqual(new Set(unshuffled));
    expect(library.sets[0].cards.map((card) => card.id)).toEqual(original);
  });
});

describe('batched practice reducer', () => {
  it('caps batches at ten and carries repeats into the next batch before unseen cards', () => {
    const library = fixture();
    library.sets = [set('twelve', NOW, ['parent'], Array.from({ length: 12 }, (_, index) => ({ f0: `Front ${index}`, f1: `Back ${index}` })))];
    let session = createPracticeSession(library, { scope: { kind: 'set', setId: 'twelve' }, frontFields: ['Front'], backFields: ['Back'], shuffle: false }, NOW);
    expect(session.batch).toHaveLength(10);
    expect(session.pending).toHaveLength(2);
    session = finishedBatch(session, false);
    expect(session.phase).toBe('checkpoint');
    expect(session.batchKnown).toBe(9);
    expect(session.batchRepeated).toBe(1);
    expect(session.carry.map((item) => item.cardId)).toEqual(['twelve-c0']);
    session = reducePractice(session, 'continue', NOW);
    expect(session.batch.map((item) => item.cardId)).toEqual(['twelve-c0', 'twelve-c10', 'twelve-c11']);
    expect(session.pending).toHaveLength(0);
    expect(session.carry).toHaveLength(0);
    session = finishedBatch(session);
    expect(session.phase).toBe('checkpoint');
    expect(session.known).toBe(12);
    session = reducePractice(session, 'continue', NOW);
    expect(session.phase).toBe('complete');
    expect(session.repeated).toBe(1);
  });

  it('supports immediate early Known without revealing', () => {
    const session = createPracticeSession(createExampleLibrary(), defaultPracticeOptions(createExampleLibrary(), { kind: 'set', setId: 'japanese-essentials' }), NOW);
    const next = reducePractice(session, 'known', NOW);
    expect(next.known).toBe(1);
    expect(next.currentIndex).toBe(1);
    expect(next.revealed).toBe(false);
  });

  it('keeps early Don’t know revealed in place until explicit Continue', () => {
    const initial = createPracticeSession(createExampleLibrary(), defaultPracticeOptions(createExampleLibrary(), { kind: 'set', setId: 'japanese-essentials' }), NOW);
    const marked = reducePractice(initial, 'unknown', NOW);
    expect(marked.currentIndex).toBe(0);
    expect(marked.earlyUnknown).toBe(true);
    expect(marked.revealed).toBe(true);
    expect(marked.repeated).toBe(1);
    expect(marked.carry).toHaveLength(1);
    expect(reducePractice(marked, 'known', NOW)).toBe(marked);
    expect(reducePractice(marked, 'unknown', NOW)).toBe(marked);
    const continued = reducePractice(marked, 'continue', NOW);
    expect(continued.currentIndex).toBe(1);
    expect(continued.earlyUnknown).toBe(false);
    expect(continued.revealed).toBe(false);
  });

  it('undoes an early Unknown after Continue and restores repetition state', () => {
    const library = createExampleLibrary();
    const initial = createPracticeSession(library, defaultPracticeOptions(library, { kind: 'set', setId: 'japanese-essentials' }), NOW);
    const marked = reducePractice(initial, 'unknown', NOW);
    const continued = reducePractice(marked, 'continue', NOW);

    expect(continued.repeated).toBe(1);
    expect(continued.carry).toHaveLength(1);
    expect(reducePractice(continued, 'undo', NOW)).toEqual(initial);
  });

  it('keeps the latest Known recoverable through the final summary until another rating', () => {
    const library = fixture();
    library.sets = [set('single', NOW, ['parent'], [{ f0: 'Only front', f1: 'Only back' }])];
    const initial = createPracticeSession(library, { scope: { kind: 'set', setId: 'single' }, frontFields: ['Front'], backFields: ['Back'], shuffle: false }, NOW);
    const rated = reducePractice(initial, 'known', NOW);
    expect(rated.phase).toBe('checkpoint');
    expect(rated.known).toBe(1);
    expect(rated.batchKnown).toBe(1);

    const complete = reducePractice(rated, 'continue', NOW);
    expect(complete.phase).toBe('complete');
    expect(complete.lastRating).not.toBeNull();
    expect(reducePractice(complete, 'undo', NOW)).toEqual(initial);
  });
});
