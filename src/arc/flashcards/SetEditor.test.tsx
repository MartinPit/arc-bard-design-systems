import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SetEditor } from './SetEditor';

afterEach(cleanup);

function renderEditor() {
  const props = {
    set: null,
    folders: [{ id: 'languages', name: 'Languages', parentId: null }],
    defaultName: 'Set 4',
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onDirtyChange: vi.fn(),
  };
  render(<SetEditor {...props} />);
  return props;
}

describe('union-grid set editor', () => {
  it('adds a row from Tab in the last cell and keeps rapid authoring in the grid', () => {
    renderEditor();
    const front = screen.getByLabelText('Card 1, Front');
    const back = screen.getByLabelText('Card 1, Back');
    fireEvent.change(front, { target: { value: 'Persimmon' } });
    fireEvent.change(back, { target: { value: 'A fruit' } });
    fireEvent.keyDown(back, { key: 'Tab' });
    expect(screen.getByLabelText('Card 2, Front')).toHaveFocus();
    expect(screen.getByLabelText('Card 2, Back')).toHaveValue('');
    fireEvent.keyDown(screen.getByLabelText('Card 2, Front'), { key: 'Tab', shiftKey: true });
    expect(screen.queryByLabelText('Card 3, Front')).not.toBeInTheDocument();
  });

  it('extends the field vocabulary globally and protects a populated field from deletion', () => {
    renderEditor();
    fireEvent.change(screen.getByLabelText('Card 1, Front'), { target: { value: '水' } });
    expect(screen.getByRole('button', { name: 'Delete unused field Front' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Add field' }));
    expect(screen.getByLabelText('Card 1, Field 3')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Field 1 name'), { target: { value: 'Character' } });
    expect(screen.getByLabelText('Card 1, Character')).toHaveValue('水');
    expect(screen.getByLabelText('Field 1 name')).toHaveValue('Character');
    expect(screen.getByRole('button', { name: 'Delete unused field Field 3' })).toBeEnabled();
  });

  it('blocks a one-sided nonempty card with a precise error and preserves its draft', () => {
    const props = renderEditor();
    fireEvent.change(screen.getByLabelText('Card 1, Front'), { target: { value: 'Incomplete thought' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Save set' })[0]);
    expect(props.onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Card 1 has only 1 populated field. Enter content in at least two different fields, or clear the row.')).toBeInTheDocument();
    expect(screen.getByLabelText('Card 1, Front')).toHaveValue('Incomplete thought');
    expect(screen.getByText('Your draft is still here.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Card 1, Back'), { target: { value: 'Now complete' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Save set' })[0]);
    expect(props.onSave).toHaveBeenCalledTimes(1);
    expect(props.onSave.mock.calls[0][0].name).toBe('Set 4');
    expect(Object.values(props.onSave.mock.calls[0][0].cards[0].values)).toEqual(['Incomplete thought', 'Now complete']);
  });

  it('discards wholly empty rows, trims content, and persists independent folder membership', () => {
    const props = renderEditor();
    fireEvent.change(screen.getByLabelText('Card 1, Front'), { target: { value: '  Front value  ' } });
    fireEvent.change(screen.getByLabelText('Card 1, Back'), { target: { value: '  Back value  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add card' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Languages' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Save set' })[0]);
    const saved = props.onSave.mock.calls[0][0];
    expect(saved.cards).toHaveLength(1);
    expect(Object.values(saved.cards[0].values)).toEqual(['Front value', 'Back value']);
    expect(saved.folderIds).toEqual(['languages']);
  });

  it('permits an explicitly saved zero-card set', () => {
    const props = renderEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Remove draft card 1' }));
    expect(screen.getByText('This set has no cards. You can save it now and author cards later; it cannot be practised yet.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Save set' })[0]);
    expect(props.onSave.mock.calls[0][0].cards).toEqual([]);
  });
});
