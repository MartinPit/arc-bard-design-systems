import { createId } from './data';
import type {
  FlashcardLibrary,
  FlashcardSet,
  PracticeItem,
  PracticeOptions,
  PracticeScope,
  PracticeSession,
} from './types';

export const PRACTICE_BATCH_SIZE = 10;

export function descendantFolderIds(library: FlashcardLibrary, folderIds: string[]) {
  const selected = new Set(folderIds);
  const found = new Set<string>();
  const visit = (id: string) => {
    if (found.has(id)) return;
    const folder = library.folders.find((item) => item.id === id);
    if (!folder) return;
    found.add(id);
    library.folders.filter((item) => item.parentId === id).forEach((item) => visit(item.id));
  };
  selected.forEach(visit);
  return found;
}

export function scopedSets(library: FlashcardLibrary, scope: PracticeScope) {
  let sets: FlashcardSet[];
  if (scope.kind === 'set') {
    sets = library.sets.filter((set) => set.id === scope.setId);
  } else {
    const includedFolders = descendantFolderIds(library, scope.folderIds);
    sets = library.sets.filter((set) => set.folderIds.some((id) => includedFolders.has(id)));
  }
  return sets
    .map((set, index) => ({ set, index }))
    .sort((a, b) => b.set.createdAt.localeCompare(a.set.createdAt) || a.index - b.index)
    .map(({ set }) => set);
}

export function scopeFieldNames(library: FlashcardLibrary, scope: PracticeScope) {
  const names = new Set<string>();
  scopedSets(library, scope).forEach((set) => set.fields.forEach((field) => names.add(field.name.trim())));
  names.delete('');
  return [...names];
}

export function defaultPracticeOptions(library: FlashcardLibrary, scope: PracticeScope): PracticeOptions {
  const names = scopeFieldNames(library, scope);
  const sets = scopedSets(library, scope);
  const simple = isSimpleTwoFieldScope(library, scope);
  const firstSetFields = sets[0]?.fields.map((field) => field.name) ?? [];
  const front = simple ? firstSetFields[0] : names.includes('Front') ? 'Front' : names[0] ?? '';
  const back = simple ? firstSetFields[1] : names.includes('Back') && names.includes('Front')
    ? 'Back'
    : names.find((name) => name !== front) ?? '';
  return {
    scope,
    frontFields: front ? [front] : [],
    backFields: back ? [back] : [],
    shuffle: false,
    ...(simple ? { direction: 'front-first' as const } : {}),
  };
}

export function practiceEligibility(library: FlashcardLibrary, options: PracticeOptions) {
  const eligible: PracticeItem[] = [];
  let skipped = 0;
  scopedSets(library, options.scope).forEach((set) => {
    const fieldIdsByName = new Map(set.fields.map((field) => [field.name.trim(), field.id]));
    const directional = options.direction && set.fields.length === 2;
    const frontFields = directional ? [set.fields[options.direction === 'front-first' ? 0 : 1].name] : options.frontFields;
    const backFields = directional ? [set.fields[options.direction === 'front-first' ? 1 : 0].name] : options.backFields;
    set.cards.forEach((card) => {
      const front = frontFields.map((name) => card.values[fieldIdsByName.get(name) ?? '']?.trim() ?? '');
      const back = backFields.map((name) => card.values[fieldIdsByName.get(name) ?? '']?.trim() ?? '');
      if (!front.length || !back.length || front.some((value) => !value) || back.some((value) => !value)) {
        skipped += 1;
        return;
      }
      eligible.push({
        key: `${set.id}:${card.id}`,
        setId: set.id,
        cardId: card.id,
        setName: set.name,
        front,
        back,
      });
    });
  });
  return { eligible, skipped };
}

function shuffled(items: PracticeItem[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function titleForScope(library: FlashcardLibrary, scope: PracticeScope) {
  if (scope.kind === 'set') return library.sets.find((set) => set.id === scope.setId)?.name ?? 'Practice';
  const names = scope.folderIds.map((id) => library.folders.find((folder) => folder.id === id)?.name).filter((name): name is string => Boolean(name));
  return names.length ? names.join(' + ') : 'Folder practice';
}

export function createPracticeSession(
  library: FlashcardLibrary,
  options: PracticeOptions,
  now = new Date().toISOString(),
  random: () => number = Math.random,
): PracticeSession {
  const { eligible, skipped } = practiceEligibility(library, options);
  const ordered = options.shuffle ? shuffled(eligible, random) : eligible;
  return {
    version: 1,
    id: createId('practice'),
    createdAt: now,
    updatedAt: now,
    title: titleForScope(library, options.scope),
    options,
    total: ordered.length,
    skipped,
    known: 0,
    repeated: 0,
    pending: ordered.slice(PRACTICE_BATCH_SIZE),
    carry: [],
    batch: ordered.slice(0, PRACTICE_BATCH_SIZE),
    currentIndex: 0,
    revealed: false,
    earlyUnknown: false,
    phase: ordered.length ? 'card' : 'complete',
    batchKnown: 0,
    batchRepeated: 0,
  };
}

function touch(session: PracticeSession, now: string): PracticeSession {
  return { ...session, updatedAt: now };
}

function advance(session: PracticeSession, now: string): PracticeSession {
  const atBatchEnd = session.currentIndex + 1 >= session.batch.length;
  return touch({
    ...session,
    currentIndex: atBatchEnd ? session.batch.length : session.currentIndex + 1,
    revealed: false,
    earlyUnknown: false,
    phase: atBatchEnd ? 'checkpoint' : 'card',
  }, now);
}

export type PracticeAction = 'reveal' | 'known' | 'unknown' | 'continue';

export function reducePractice(session: PracticeSession, action: PracticeAction, now = new Date().toISOString()): PracticeSession {
  if (session.phase === 'complete') return session;
  if (session.phase === 'checkpoint') {
    if (action !== 'continue') return session;
    if (!session.carry.length && !session.pending.length) return touch({ ...session, phase: 'complete' }, now);
    const batch = [...session.carry, ...session.pending].slice(0, PRACTICE_BATCH_SIZE);
    const batchKeys = new Set(batch.map((item) => item.key));
    return touch({
      ...session,
      batch,
      carry: session.carry.filter((item) => !batchKeys.has(item.key)),
      pending: session.pending.filter((item) => !batchKeys.has(item.key)),
      currentIndex: 0,
      revealed: false,
      earlyUnknown: false,
      phase: 'card',
      batchKnown: 0,
      batchRepeated: 0,
    }, now);
  }

  if (action === 'reveal' && !session.revealed) return touch({ ...session, revealed: true }, now);
  if (action === 'continue' && session.earlyUnknown) return advance(session, now);
  if (action === 'known' && !session.earlyUnknown) {
    return advance({ ...session, known: session.known + 1, batchKnown: session.batchKnown + 1 }, now);
  }
  if (action === 'unknown' && !session.earlyUnknown) {
    const current = session.batch[session.currentIndex];
    if (!current) return session;
    const marked = {
      ...session,
      carry: [...session.carry, current],
      repeated: session.repeated + 1,
      batchRepeated: session.batchRepeated + 1,
      revealed: true,
    };
    if (!session.revealed) return touch({ ...marked, earlyUnknown: true }, now);
    return advance(marked, now);
  }
  return session;
}

export function isSimpleTwoFieldScope(library: FlashcardLibrary, scope: PracticeScope) {
  const sets = scopedSets(library, scope);
  return sets.length > 0 && sets.every((set) => set.fields.length === 2);
}
