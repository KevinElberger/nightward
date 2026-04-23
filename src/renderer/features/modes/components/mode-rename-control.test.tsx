// @vitest-environment happy-dom

import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MODE_NAME_MAX_LENGTH } from '../../../../shared/modes';
import { ModeRenameControl } from './mode-rename-control';

type RenameHandler = (id: string, name: string) => Promise<unknown>;
type ModeRenameControlVariant = 'title' | 'row';

const renderModeRenameControl = ({
  leadingContent,
  modeId = 'mode-1',
  name = 'Focus',
  onRenameMode = vi.fn().mockResolvedValue({ id: modeId, name: 'Deep Work' }),
  variant = 'title'
}: {
  leadingContent?: ReactNode;
  modeId?: string;
  name?: string;
  onRenameMode?: RenameHandler;
  variant?: ModeRenameControlVariant;
} = {}) => {
  render(
    <ModeRenameControl
      leadingContent={leadingContent}
      modeId={modeId}
      name={name}
      onRenameMode={onRenameMode}
      variant={variant}
    >
      {({ startRenaming, triggerButtonClassName, triggerButtonSize }) => (
        <button
          type="button"
          className={triggerButtonClassName}
          data-size={triggerButtonSize}
          onClick={startRenaming}
        >
          Rename
        </button>
      )}
    </ModeRenameControl>
  );

  return { onRenameMode };
};

const startRenaming = () => {
  fireEvent.click(screen.getByRole('button', { name: /^rename$/i }));
};

describe('ModeRenameControl', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('passes title trigger props and renders the title rename form', () => {
    renderModeRenameControl();

    expect(screen.getByRole('button', { name: /^rename$/i }).getAttribute('data-size')).toBe(
      'icon-xs'
    );

    startRenaming();

    const input = screen.getByLabelText('Mode name') as HTMLInputElement;

    expect(input.value).toBe('Focus');
    expect(input.maxLength).toBe(MODE_NAME_MAX_LENGTH);
    expect(screen.getByRole('button', { name: /save mode name/i }).getAttribute('data-size')).toBe(
      'icon-xs'
    );
    expect(
      screen.getByRole('button', { name: /cancel renaming mode/i }).getAttribute('data-size')
    ).toBe('icon-xs');
  });

  it('renders the row rename form with a contextual label and leading content', () => {
    renderModeRenameControl({
      leadingContent: <span>Status marker</span>,
      variant: 'row'
    });

    expect(screen.getByRole('button', { name: /^rename$/i }).getAttribute('data-size')).toBe(
      'icon-sm'
    );

    startRenaming();

    expect(screen.getByLabelText('Mode name for Focus')).not.toBeNull();
    expect(screen.getByText('Status marker')).not.toBeNull();
    expect(screen.getByRole('button', { name: /save mode name/i }).getAttribute('data-size')).toBe(
      'icon-sm'
    );
    expect(
      screen.getByRole('button', { name: /cancel renaming mode/i }).getAttribute('data-size')
    ).toBe('icon-sm');
  });

  it('saves a trimmed renamed mode', async () => {
    const { onRenameMode } = renderModeRenameControl();

    startRenaming();
    fireEvent.change(screen.getByLabelText('Mode name'), { target: { value: '  Deep Work  ' } });
    fireEvent.click(screen.getByRole('button', { name: /save mode name/i }));

    await waitFor(() => {
      expect(onRenameMode).toHaveBeenCalledWith('mode-1', 'Deep Work');
    });
    await waitFor(() => {
      expect(screen.queryByLabelText('Mode name')).toBeNull();
    });
    expect(screen.getByRole('button', { name: /^rename$/i })).not.toBeNull();
  });

  it('does not save blank names', () => {
    const { onRenameMode } = renderModeRenameControl();

    startRenaming();
    fireEvent.change(screen.getByLabelText('Mode name'), { target: { value: '   ' } });

    const saveButton = screen.getByRole('button', { name: /save mode name/i });

    expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(saveButton);
    expect(onRenameMode).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Mode name')).not.toBeNull();
  });

  it('cancels renaming from the cancel button', () => {
    const { onRenameMode } = renderModeRenameControl();

    startRenaming();
    fireEvent.change(screen.getByLabelText('Mode name'), { target: { value: 'Deep Work' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel renaming mode/i }));

    expect(screen.queryByLabelText('Mode name')).toBeNull();
    expect(screen.getByRole('button', { name: /^rename$/i })).not.toBeNull();
    expect(onRenameMode).not.toHaveBeenCalled();
  });
});
