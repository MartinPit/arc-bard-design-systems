export interface FlashcardField {
  id: string;
  name: string;
}

export interface Flashcard {
  id: string;
  values: Record<string, string>;
}

export interface FlashcardSet {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  folderIds: string[];
  fields: FlashcardField[];
  cards: Flashcard[];
}

export interface FlashcardFolder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface FlashcardLibrary {
  version: 1;
  sets: FlashcardSet[];
  folders: FlashcardFolder[];
}

export type PracticeScope =
  | { kind: 'set'; setId: string }
  | { kind: 'folders'; folderIds: string[] };

export interface PracticeOptions {
  scope: PracticeScope;
  frontFields: string[];
  backFields: string[];
  shuffle: boolean;
  /** Two-field sets use their own editor order, even when field names differ. */
  direction?: 'front-first' | 'back-first';
}

export interface PracticeItem {
  key: string;
  setId: string;
  cardId: string;
  setName: string;
  front: string[];
  back: string[];
}

export type PracticePhase = 'card' | 'checkpoint' | 'complete';

export interface PracticeSessionState {
  version: 1;
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  options: PracticeOptions;
  total: number;
  skipped: number;
  known: number;
  repeated: number;
  pending: PracticeItem[];
  carry: PracticeItem[];
  batch: PracticeItem[];
  currentIndex: number;
  revealed: boolean;
  earlyUnknown: boolean;
  phase: PracticePhase;
  batchKnown: number;
  batchRepeated: number;
}

export interface PracticeSession extends PracticeSessionState {
  /** The complete state before the latest rating, available until the next rating. */
  lastRating: PracticeSessionState | null;
}

export interface FlashcardDraft {
  id: string | null;
  name: string;
  folderIds: string[];
  fields: FlashcardField[];
  cards: Flashcard[];
  createdAt?: string;
}
