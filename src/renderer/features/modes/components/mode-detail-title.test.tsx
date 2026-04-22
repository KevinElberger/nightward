// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MODE_NAME_MAX_LENGTH } from '../../../../shared/modes';
import { ModeDetailTitle } from './mode-detail-title';

const renderModeDetailTitle = (onRenameMode = vi.fn().mockResolvedValue({ id: 'mode-1' })) => {
  render(<ModeDetailTitle modeId="mode-1" name="Focus" onRenameMode={onRenameMode} />);

  return { onRenameMode };
};

const startRenaming = () => {
  fireEvent.click(screen.getByRole('button', { name: /rename mode/i }));

  return screen.getByLabelText('Mode name') as HTMLInputElement;
};

describe('ModeDetailTitle', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('enters rename mode when the title edit control is clicked', () => {
    renderModeDetailTitle();

    const input = startRenaming();

    expect(input.value).toBe('Focus');
    expect(input.maxLength).toBe(MODE_NAME_MAX_LENGTH);
    expect(document.activeElement).toBe(input);
  });

  it('saves a trimmed mode name', async () => {
    const { onRenameMode } = renderModeDetailTitle();
    const input = startRenaming();

    fireEvent.change(input, { target: { value: '  Deep Work  ' } });
    fireEvent.click(screen.getByRole('button', { name: /save mode name/i }));

    await waitFor(() => {
      expect(onRenameMode).toHaveBeenCalledWith('mode-1', 'Deep Work');
    });
    await waitFor(() => {
      expect(screen.queryByLabelText('Mode name')).toBeNull();
    });
  });

  it('does not submit blank mode names', () => {
    const { onRenameMode } = renderModeDetailTitle();
    const input = startRenaming();

    fireEvent.change(input, { target: { value: '   ' } });

    const saveButton = screen.getByRole('button', { name: /save mode name/i });

    expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(saveButton);
    expect(onRenameMode).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Mode name')).toBe(input);
  });

  it('exits rename mode without saving unchanged names', async () => {
    const { onRenameMode } = renderModeDetailTitle();

    startRenaming();
    fireEvent.click(screen.getByRole('button', { name: /save mode name/i }));

    await waitFor(() => {
      expect(screen.queryByLabelText('Mode name')).toBeNull();
    });
    expect(onRenameMode).not.toHaveBeenCalled();
  });

  it('cancels renaming when Escape is pressed', () => {
    const { onRenameMode } = renderModeDetailTitle();
    const input = startRenaming();

    fireEvent.change(input, { target: { value: 'Deep Work' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByLabelText('Mode name')).toBeNull();
    expect(screen.getByText('Focus')).not.toBeNull();
    expect(onRenameMode).not.toHaveBeenCalled();
  });

  it('cancels renaming from the cancel button', () => {
    const { onRenameMode } = renderModeDetailTitle();
    const input = startRenaming();

    fireEvent.change(input, { target: { value: 'Deep Work' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel renaming mode/i }));

    expect(screen.queryByLabelText('Mode name')).toBeNull();
    expect(screen.getByText('Focus')).not.toBeNull();
    expect(onRenameMode).not.toHaveBeenCalled();
  });
});
