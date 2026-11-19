import type { FlashcardLibrary, FlashcardSet } from './types';

let idSequence = 0;

export function createId(prefix: string) {
  idSequence += 1;
  try {
    if (typeof crypto.randomUUID === 'function') return `${prefix}-${crypto.randomUUID()}`;
  } catch {
    // A local identifier does not require cryptographic randomness.
  }
  return `${prefix}-${Date.now().toString(36)}-${idSequence.toString(36)}`;
}

function twoFieldSet(
  id: string,
  name: string,
  createdAt: string,
  folderIds: string[],
  rows: Array<[string, string]>,
  front = 'Front',
  back = 'Back',
): FlashcardSet {
  return {
    id,
    name,
    createdAt,
    updatedAt: createdAt,
    folderIds,
    fields: [{ id: `${id}-front`, name: front }, { id: `${id}-back`, name: back }],
    cards: rows.map(([first, second], index) => ({
      id: `${id}-card-${index + 1}`,
      values: { [`${id}-front`]: first, [`${id}-back`]: second },
    })),
  };
}

export function createExampleLibrary(): FlashcardLibrary {
  const japanese: FlashcardSet = {
    id: 'japanese-essentials',
    name: 'Japanese essentials',
    createdAt: '2026-11-17T09:00:00.000Z',
    updatedAt: '2026-11-17T09:00:00.000Z',
    folderIds: ['japanese', 'travel'],
    fields: [
      { id: 'jp-character', name: 'Character' },
      { id: 'jp-reading', name: 'Reading' },
      { id: 'jp-meaning', name: 'Meaning' },
      { id: 'jp-example', name: 'Example' },
    ],
    cards: [
      { id: 'jp-1', values: { 'jp-character': '水', 'jp-reading': 'mizu', 'jp-meaning': 'water', 'jp-example': '水をください。' } },
      { id: 'jp-2', values: { 'jp-character': '木', 'jp-reading': 'ki', 'jp-meaning': 'tree' } },
      { id: 'jp-3', values: { 'jp-character': '駅', 'jp-reading': 'eki', 'jp-meaning': 'station', 'jp-example': '駅はどこですか。' } },
      { id: 'jp-4', values: { 'jp-character': '川', 'jp-reading': 'kawa', 'jp-meaning': 'river' } },
      { id: 'jp-5', values: { 'jp-character': '食べる', 'jp-reading': 'taberu', 'jp-meaning': 'to eat', 'jp-example': '朝ご飯を食べる。' } },
      { id: 'jp-6', values: { 'jp-character': '本', 'jp-reading': 'hon', 'jp-meaning': 'book' } },
      { id: 'jp-7', values: { 'jp-character': '友達', 'jp-reading': 'tomodachi', 'jp-meaning': 'friend', 'jp-example': '友達に会う。' } },
      { id: 'jp-8', values: { 'jp-character': '道', 'jp-reading': 'michi', 'jp-meaning': 'road' } },
      { id: 'jp-9', values: { 'jp-character': '新しい', 'jp-reading': 'atarashii', 'jp-meaning': 'new' } },
      { id: 'jp-10', values: { 'jp-character': '店', 'jp-reading': 'mise', 'jp-meaning': 'shop', 'jp-example': '店を開ける。' } },
      { id: 'jp-11', values: { 'jp-character': '今日', 'jp-reading': 'kyō', 'jp-meaning': 'today' } },
      { id: 'jp-12', values: { 'jp-character': 'ありがとう', 'jp-reading': 'arigatō', 'jp-meaning': 'thank you' } },
    ],
  };

  return {
    version: 1,
    folders: [
      { id: 'languages', name: 'Languages', parentId: null },
      { id: 'japanese', name: 'Japanese', parentId: 'languages' },
      { id: 'jlpt', name: 'JLPT N5', parentId: 'japanese' },
      { id: 'spanish', name: 'Spanish', parentId: 'languages' },
      { id: 'italian', name: 'Italian', parentId: 'languages' },
      { id: 'medicine', name: 'Medicine', parentId: null },
      { id: 'anatomy', name: 'Anatomy', parentId: 'medicine' },
      { id: 'physiology', name: 'Physiology', parentId: 'medicine' },
      { id: 'visual-culture', name: 'Visual culture', parentId: null },
      { id: 'modern-art', name: 'Modern art', parentId: 'visual-culture' },
      { id: 'technology', name: 'Technology', parentId: null },
      { id: 'chess', name: 'Chess', parentId: null },
      { id: 'travel', name: 'Travel 2027', parentId: null },
    ],
    sets: [
      japanese,
      twoFieldSet('human-anatomy', 'Human anatomy', '2026-11-15T10:00:00.000Z', ['anatomy'], [
        ['Femur', 'The thigh bone; the longest bone in the human body'],
        ['Scapula', 'The shoulder blade'],
        ['Cranium', 'The part of the skull enclosing the brain'],
        ['Patella', 'The kneecap'],
        ['Sternum', 'The breastbone'],
        ['Clavicle', 'The collarbone'],
        ['Humerus', 'The upper arm bone'],
        ['Pelvis', 'The basin-shaped structure supporting the spine'],
      ], 'Structure', 'Description'),
      twoFieldSet('spanish-verbs', 'Spanish verbs', '2026-11-12T16:00:00.000Z', ['spanish'], [
        ['hablar', 'to speak'], ['comer', 'to eat'], ['vivir', 'to live'], ['tener', 'to have'],
        ['hacer', 'to make or do'], ['poder', 'to be able to'], ['decir', 'to say'], ['ir', 'to go'],
      ], 'Infinitive', 'Meaning'),
      twoFieldSet('art-since-1900', 'Art since 1900', '2026-11-08T12:00:00.000Z', ['modern-art'], [
        ['Fauvism', 'Bold, non-naturalistic colour and energetic brushwork'],
        ['Cubism', 'Subjects fractured into multiple simultaneous viewpoints'],
        ['Dada', 'An anti-art movement shaped by absurdity and chance'],
        ['Bauhaus', 'A school uniting craft, design and modern industry'],
        ['Surrealism', 'Dream imagery and the unconscious made visible'],
      ], 'Movement', 'Key idea'),
      twoFieldSet('cloud-terminology', 'Cloud terminology', '2026-11-02T08:00:00.000Z', ['technology'], [
        ['Region', 'A geographic area containing multiple isolated data centres'],
        ['Latency', 'The delay before a transfer of data begins'],
        ['Throughput', 'The amount of data transferred in a period of time'],
        ['Autoscaling', 'Adjusting capacity automatically to match demand'],
        ['Object storage', 'Data storage managing information as discrete objects'],
      ], 'Term', 'Definition'),
      twoFieldSet('chess-openings', 'Chess openings', '2026-10-29T18:00:00.000Z', ['chess'], [
        ['Italian Game', '1. e4 e5 2. Nf3 Nc6 3. Bc4'],
        ['Sicilian Defence', '1. e4 c5'],
        ['Queen’s Gambit', '1. d4 d5 2. c4'],
        ['Caro–Kann', '1. e4 c6'],
        ['London System', 'A setup featuring d4, Nf3 and Bf4'],
        ['French Defence', '1. e4 e6'],
      ], 'Opening', 'First moves'),
      twoFieldSet('italian-at-the-cafe', 'Italian at the café', '2026-10-22T08:30:00.000Z', ['italian', 'travel'], [
        ['Un caffè, per favore', 'A coffee, please'], ['Il conto', 'The bill'],
        ['Da portare via', 'To take away'], ['Un tavolo per due', 'A table for two'],
      ], 'Italian', 'English'),
      twoFieldSet('cell-respiration', 'Cell respiration', '2026-10-18T14:00:00.000Z', ['physiology'], [
        ['Glycolysis', 'Glucose is broken down into pyruvate in the cytoplasm'],
        ['Mitochondrion', 'The organelle where most aerobic respiration occurs'],
        ['ATP', 'Adenosine triphosphate, an immediate energy carrier'],
        ['Aerobic', 'Requiring oxygen'],
      ]),
      twoFieldSet('travel-phrases', 'Travel phrases', '2026-10-10T11:00:00.000Z', ['travel'], [
        ['Where is the platform?', 'どのホームですか。'], ['A return ticket, please', '往復切符をください。'],
        ['I have a reservation', '予約しています。'],
      ], 'English', 'Japanese'),
    ],
  };
}

export function createNewDraft(): { name: string; folderIds: string[]; fields: FlashcardSet['fields']; cards: FlashcardSet['cards'] } {
  return {
    name: '',
    folderIds: [],
    fields: [{ id: createId('field'), name: 'Front' }, { id: createId('field'), name: 'Back' }],
    cards: [{ id: createId('card'), values: {} }],
  };
}

export function nextSetName(sets: FlashcardSet[]) {
  const used = new Set(sets.map((set) => set.name));
  let index = 1;
  while (used.has(`Set ${index}`)) index += 1;
  return `Set ${index}`;
}
