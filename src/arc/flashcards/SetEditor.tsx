import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { Button, Checkbox, TextInput } from '../components';
import { createId } from './data';
import { isEmptyDraftCard, normalizeDraft, validateDraft, type DraftErrors } from './editorLogic';
import type { FlashcardDraft, FlashcardFolder, FlashcardSet } from './types';

interface SetEditorProps {
  set: FlashcardSet | null;
  folders: FlashcardFolder[];
  defaultName: string;
  onSave: (draft: FlashcardDraft) => void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

function draftFromSet(set: FlashcardSet | null): FlashcardDraft {
  if (!set) {
    return {
      id: null,
      name: '',
      folderIds: [],
      fields: [{ id: createId('field'), name: 'Front' }, { id: createId('field'), name: 'Back' }],
      cards: [{ id: createId('card'), values: {} }],
    };
  }
  return {
    id: set.id,
    name: set.name,
    folderIds: [...set.folderIds],
    fields: set.fields.map((field) => ({ ...field })),
    cards: set.cards.map((card) => ({ ...card, values: { ...card.values } })),
    createdAt: set.createdAt,
  };
}

export function SetEditor({ set, folders, defaultName, onSave, onCancel, onDirtyChange }: SetEditorProps) {
  const [draft, setDraft] = useState<FlashcardDraft>(() => draftFromSet(set));
  const [errors, setErrors] = useState<DraftErrors>({ cards: {}, fields: {} });
  const initial = useRef(JSON.stringify(draft));
  const dirty = JSON.stringify(draft) !== initial.current;
  const focusNewRow = useRef(false);

  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    if (!focusNewRow.current || !draft.fields.length || !draft.cards.length) return;
    focusNewRow.current = false;
    const card = draft.cards[draft.cards.length - 1];
    const field = draft.fields[0];
    document.getElementById(`editor-cell-${card.id}-${field.id}`)?.focus();
  }, [draft.cards.length, draft.fields]);

  function addCard() {
    setDraft((current) => ({ ...current, cards: [...current.cards, { id: createId('card'), values: {} }] }));
    focusNewRow.current = true;
  }

  function save(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    const fieldError = draft.fields.find((field) => nextErrors.fields[field.id]);
    const cardError = draft.cards.find((card) => nextErrors.cards[card.id]);
    if (fieldError || cardError) {
      window.requestAnimationFrame(() => {
        const target = fieldError
          ? document.getElementById(`field-name-${fieldError.id}`)
          : document.getElementById(`editor-cell-${cardError?.id}-${draft.fields[0]?.id}`);
        target?.focus();
      });
      return;
    }
    onSave(normalizeDraft(draft, defaultName));
  }

  function onCellKeyDown(event: KeyboardEvent<HTMLInputElement>, cardIndex: number, fieldIndex: number) {
    if (event.key !== 'Tab' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    if (cardIndex !== draft.cards.length - 1 || fieldIndex !== draft.fields.length - 1) return;
    event.preventDefault();
    addCard();
  }

  return (
    <form className="fc-editor" onSubmit={save} noValidate>
      <header className="fc-page-heading fc-editor__heading">
        <div>
          <h1>{set ? `Edit ${set.name}` : 'Make a new set.'}</h1>
          <p>Every named field is available to every card. Leave a cell blank when that card does not use the field.</p>
        </div>
        <div className="fc-actions">
          <Button variant="quiet" onClick={onCancel}><X size={17} aria-hidden="true" />Cancel</Button>
          <Button type="submit"><Save size={17} aria-hidden="true" />Save set</Button>
        </div>
      </header>

      <section className="fc-editor__details" aria-labelledby="set-details-title">
        <h2 id="set-details-title" className="fc-section-heading">Set details</h2>
        <TextInput
          id="set-name"
          name="set-name"
          label="Set name"
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          placeholder={defaultName}
          hint={`Leave blank to use “${defaultName}”.`}
          autoComplete="off"
        />
        <fieldset className="fc-membership">
          <legend>Folder membership <span>(optional; choose any number)</span></legend>
          {folders.length ? (
            <div className="fc-membership__options">
              {folders.map((folder) => (
                <Checkbox
                  key={folder.id}
                  label={folder.name}
                  checked={draft.folderIds.includes(folder.id)}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    folderIds: event.target.checked
                      ? [...current.folderIds, folder.id]
                      : current.folderIds.filter((id) => id !== folder.id),
                  }))}
                />
              ))}
            </div>
          ) : <p>No folders yet. This set can remain unfiled.</p>}
        </fieldset>
      </section>

      {Object.values(errors.fields).some(Boolean) || Object.values(errors.cards).some(Boolean) ? (
        <div className="fc-error-summary" role="alert" tabIndex={-1}>
          <strong>Your draft is still here.</strong> Fix the marked fields before saving. A nonempty card needs content in at least two distinct fields.
        </div>
      ) : null}

      <section className="fc-grid-section" aria-labelledby="cards-heading">
        <div className="fc-section-title-row">
          <div>
            <h2 id="cards-heading">Cards & fields</h2>
          </div>
          <div className="fc-actions">
            <Button variant="secondary" onClick={() => {
              const id = createId('field');
              setDraft((current) => ({ ...current, fields: [...current.fields, { id, name: `Field ${current.fields.length + 1}` }] }));
              window.requestAnimationFrame(() => document.getElementById(`field-name-${id}`)?.focus());
            }}><Plus size={16} aria-hidden="true" />Add field</Button>
            <Button variant="secondary" onClick={addCard}><Plus size={16} aria-hidden="true" />Add card</Button>
          </div>
        </div>

        <div className="fc-editor-grid" role="grid" aria-label="Flashcard union grid" aria-rowcount={draft.cards.length + 1} aria-colcount={draft.fields.length + 2}>
          <div className="fc-editor-grid__row fc-editor-grid__header" role="row" style={{ '--fc-field-count': draft.fields.length, minWidth: `${112 + draft.fields.length * 180}px` } as React.CSSProperties}>
            <div className="fc-editor-grid__number" role="columnheader">Card</div>
            {draft.fields.map((field, index) => {
              const used = draft.cards.some((card) => Boolean(card.values[field.id]?.trim()));
              return (
                <div className="fc-editor-grid__field" role="columnheader" key={field.id}>
                  <TextInput
                    id={`field-name-${field.id}`}
                    label={`Field ${index + 1} name`}
                    value={field.name}
                    error={errors.fields[field.id]}
                    autoComplete="off"
                    onChange={(event) => {
                      const name = event.target.value;
                      setDraft((current) => ({ ...current, fields: current.fields.map((item) => item.id === field.id ? { ...item, name } : item) }));
                      setErrors((current) => ({ ...current, fields: { ...current.fields, [field.id]: '' } }));
                    }}
                  />
                  <Button
                    variant="quiet"
                    className="fc-delete-field"
                    disabled={used}
                    title={used ? 'A field can be deleted only after every cell in it is blank.' : `Delete unused ${field.name || 'field'}`}
                    aria-label={`Delete unused field ${field.name || index + 1}`}
                    onClick={() => setDraft((current) => ({
                      ...current,
                      fields: current.fields.filter((item) => item.id !== field.id),
                      cards: current.cards.map((card) => {
                        const values = { ...card.values };
                        delete values[field.id];
                        return { ...card, values };
                      }),
                    }))}
                  ><Trash2 size={15} aria-hidden="true" /><span>Delete field</span></Button>
                </div>
              );
            })}
            <div className="fc-editor-grid__row-actions" role="columnheader"><span className="fc-sr-only">Row actions</span></div>
          </div>

          {draft.cards.map((card, cardIndex) => (
            <div className="fc-editor-grid__row" role="row" key={card.id} style={{ '--fc-field-count': draft.fields.length, minWidth: `${112 + draft.fields.length * 180}px` } as React.CSSProperties}>
              <div className="fc-editor-grid__number" role="rowheader">{cardIndex + 1}</div>
              {draft.fields.map((field, fieldIndex) => {
                const cellId = `editor-cell-${card.id}-${field.id}`;
                const error = errors.cards[card.id];
                return (
                  <div className="fc-editor-grid__cell" role="gridcell" key={field.id}>
                    <label className="fc-sr-only" htmlFor={cellId}>Card {cardIndex + 1}, {field.name || `field ${fieldIndex + 1}`}</label>
                    <input
                      id={cellId}
                      className={`arc-input${error ? ' arc-input--invalid' : ''}`}
                      value={card.values[field.id] ?? ''}
                      autoComplete="off"
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `card-error-${card.id}` : undefined}
                      onKeyDown={(event) => onCellKeyDown(event, cardIndex, fieldIndex)}
                      onChange={(event) => {
                        const value = event.target.value;
                        setDraft((current) => ({
                          ...current,
                          cards: current.cards.map((item) => item.id === card.id ? { ...item, values: { ...item.values, [field.id]: value } } : item),
                        }));
                        if (!isEmptyDraftCard({ ...card.values, [field.id]: value }) && populatedAfterChange(card.values, field.id, value) >= 2) {
                          setErrors((current) => ({ ...current, cards: { ...current.cards, [card.id]: '' } }));
                        }
                      }}
                    />
                  </div>
                );
              })}
              <div className="fc-editor-grid__row-actions" role="gridcell">
                <Button variant="quiet" aria-label={`Remove draft card ${cardIndex + 1}`} onClick={() => setDraft((current) => ({ ...current, cards: current.cards.filter((item) => item.id !== card.id) }))}>
                  <Trash2 size={16} aria-hidden="true" /><span className="fc-sr-only">Remove</span>
                </Button>
              </div>
              {errors.cards[card.id] && <p className="fc-editor-grid__error" id={`card-error-${card.id}`} role="alert">{errors.cards[card.id]}</p>}
            </div>
          ))}
          {!draft.cards.length && <div className="fc-empty-row"><p>This set has no cards. You can save it now and author cards later; it cannot be practised yet.</p><Button variant="secondary" onClick={addCard}><Plus size={16} aria-hidden="true" />Add the first card</Button></div>}
          {!draft.fields.length && <p className="fc-inline-note">Add a field before authoring a card.</p>}
        </div>
        <p className="fc-editor-help">Keyboard tip: press <kbd>Tab</kbd> in the last cell to add the next card. Empty rows are discarded when you save.</p>
      </section>

      <div className="fc-editor__sticky-actions">
        <span aria-live="polite">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        <div className="fc-actions"><Button variant="quiet" onClick={onCancel}>Cancel</Button><Button type="submit"><Save size={17} aria-hidden="true" />Save set</Button></div>
      </div>
    </form>
  );
}

function populatedAfterChange(values: Record<string, string>, fieldId: string, value: string) {
  return Object.entries({ ...values, [fieldId]: value }).filter(([, content]) => content.trim()).length;
}
