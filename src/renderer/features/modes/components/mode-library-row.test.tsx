// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildSavedMode } from '@test/builders/shared/modes';
import { MODE_NAME_MAX_LENGTH, type SavedMode } from '../../../../shared/modes';
import { ModeLibraryRow } from './mode-library-row';

const renderModeLibraryRow = ({
  mode = buildSavedMode(),
  onActivateMode = vi.fn().mockResolvedValue(true),
  onRenameMode = vi.fn().mockResolvedValue(buildSavedMode({ name: 'Deep Work' })),
  onSelectMode = vi.fn()
}: {
  mode?: SavedMode;
  onActivateMode?: (id: string) => Promise<boolean>;
  onRenameMode?: (id: string, name: string) => Promise<SavedMode | null>;
  onSelectMode?: (modeId: string | null) => void;
} = {}) => {
  render(
    <ModeLibraryRow
      isActive={false}
      isSelected={false}
      mode={mode}
      onActivateMode={onActivateMode}
      onDeactivateMode={vi.fn().mockResolvedValue(true)}
      onDeleteMode={vi.fn().mockResolvedValue(true)}
      onRenameMode={onRenameMode}
      onSelectMode={onSelectMode}
      onSetPinned={vi.fn().mockResolvedValue(mode)}
    />
  );

  return { mode, onActivateMode, onRenameMode, onSelectMode };
};

const startRenaming = async () => {
  fireEvent.pointerDown(screen.getByRole('button', { name: /open actions for focus/i }), {
    button: 0,
    ctrlKey: false
  });

  const renameItem = await screen.findByRole('menuitem', { name: /rename/i });
  fireEvent.click(renameItem);

  return screen.getByLabelText(/mode name for focus/i) as HTMLInputElement;
};

describe('ModeLibraryRow', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('starts inline renaming from the row overflow menu', async () => {
    renderModeLibraryRow();

    const input = await startRenaming();

    expect(input.value).toBe('Focus');
    expect(input.maxLength).toBe(MODE_NAME_MAX_LENGTH);
    expect(document.activeElement).toBe(input);
  });

  it('selects the mode from the row details hit target', () => {
    const { onSelectMode } = renderModeLibraryRow();

    fireEvent.click(screen.getByRole('button', { name: /open details for focus/i }));

    expect(onSelectMode).toHaveBeenCalledWith('mode-1');
  });

  it('does not select the mode when activating from the row controls', () => {
    const onActivateMode = vi.fn().mockResolvedValue(true);
    const onSelectMode = vi.fn();
    renderModeLibraryRow({ onActivateMode, onSelectMode });

    fireEvent.click(screen.getByRole('button', { name: /^activate$/i }));

    expect(onActivateMode).toHaveBeenCalledWith('mode-1');
    expect(onSelectMode).not.toHaveBeenCalled();
  });

  it('saves a trimmed inline rename', async () => {
    const { onRenameMode } = renderModeLibraryRow();
    const input = await startRenaming();

    fireEvent.change(input, { target: { value: '  Deep Work  ' } });
    fireEvent.click(screen.getByRole('button', { name: /save mode name/i }));

    await waitFor(() => {
      expect(onRenameMode).toHaveBeenCalledWith('mode-1', 'Deep Work');
    });
    await waitFor(() => {
      expect(screen.queryByLabelText(/mode name for focus/i)).toBeNull();
    });
  });

  it('does not save blank inline names', async () => {
    const { onRenameMode } = renderModeLibraryRow();
    const input = await startRenaming();

    fireEvent.change(input, { target: { value: '   ' } });

    const saveButton = screen.getByRole('button', { name: /save mode name/i });

    expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(saveButton);
    expect(onRenameMode).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/mode name for focus/i)).toBe(input);
  });

  it('cancels inline renaming with Escape', async () => {
    const { onRenameMode } = renderModeLibraryRow();
    const input = await startRenaming();

    fireEvent.change(input, { target: { value: 'Deep Work' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByLabelText(/mode name for focus/i)).toBeNull();
    expect(screen.getByText('Focus')).not.toBeNull();
    expect(onRenameMode).not.toHaveBeenCalled();
  });
});
