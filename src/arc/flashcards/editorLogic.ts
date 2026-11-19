import type { FlashcardDraft } from './types';

export interface DraftErrors {
  cards: Record<string, string>;
  fields: Record<string, string>;
}

export function populatedFieldCount(values: Record<string, string>) {
  return Object.values(values).filter((value) => value.trim().length > 0).length;
}

export function isEmptyDraftCard(values: Record<string, string>) {
  return populatedFieldCount(values) === 0;
}

export function validateDraft(draft: FlashcardDraft): DraftErrors {
  const errors: DraftErrors = { cards: {}, fields: {} };
  const usedNames = new Map<string, string>();
  draft.fields.forEach((field) => {
    const name = field.name.trim();
    if (!name) errors.fields[field.id] = 'Enter a field name.';
    else if (usedNames.has(name.toLocaleLowerCase())) errors.fields[field.id] = `Field names must be unique; “${name}” is already used.`;
    else usedNames.set(name.toLocaleLowerCase(), field.id);
  });
  draft.cards.forEach((card, index) => {
    if (isEmptyDraftCard(card.values)) return;
    const count = populatedFieldCount(card.values);
    if (count < 2) errors.cards[card.id] = `Card ${index + 1} has only ${count} populated field. Enter content in at least two different fields, or clear the row.`;
  });
  return errors;
}

export function normalizeDraft(draft: FlashcardDraft, defaultName: string): FlashcardDraft {
  return {
    ...draft,
    name: draft.name.trim() || defaultName,
    fields: draft.fields.map((field) => ({ ...field, name: field.name.trim() })),
    cards: draft.cards.filter((card) => !isEmptyDraftCard(card.values)).map((card) => ({
      ...card,
      values: Object.fromEntries(draft.fields.map((field) => [field.id, card.values[field.id]?.trim() ?? ''])),
    })),
  };
}
