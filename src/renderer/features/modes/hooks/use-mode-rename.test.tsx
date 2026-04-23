// @vitest-environment happy-dom

import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useModeRename } from './use-mode-rename';

type RenameHarnessProps = {
  name?: string;
  onRenameMode?: (id: string, name: string) => Promise<unknown>;
};

function RenameHarness({
  name = 'Focus',
  onRenameMode = vi.fn().mockResolvedValue({ id: 'mode-1' })
}: RenameHarnessProps) {
  const {
    draftName,
    isRenaming,
    renameInputRef,
    setDraftName,
    startRenaming
  } = useModeRename({
    modeId: 'mode-1',
    name,
    onRenameMode
  });

  if (!isRenaming) {
    return (
      <>
        <button type="button" onClick={startRenaming}>
          Rename
        </button>
        <button type="button">Focus thief</button>
      </>
    );
  }

  return (
    <>
      <input
        ref={renameInputRef}
        aria-label="Mode name"
        value={draftName}
        onChange={(event) => {
          setDraftName(event.target.value);
        }}
      />
      <button type="button">Focus thief</button>
    </>
  );
}

describe('useModeRename', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('starts renaming with the current mode name', () => {
    const onRenameMode = vi.fn().mockResolvedValue({ id: 'mode-1' });
    const { result } = renderHook(() =>
      useModeRename({
        modeId: 'mode-1',
        name: 'Focus',
        onRenameMode
      })
    );

    act(() => {
      result.current.startRenaming();
    });

    expect(result.current.draftName).toBe('Focus');
    expect(result.current.isRenaming).toBe(true);
    expect(result.current.canSaveName).toBe(true);
  });

  it('trims names before saving and exits rename mode when the save succeeds', async () => {
    const onRenameMode = vi.fn().mockResolvedValue({ id: 'mode-1' });
    const { result } = renderHook(() =>
      useModeRename({
        modeId: 'mode-1',
        name: 'Focus',
        onRenameMode
      })
    );

    act(() => {
      result.current.startRenaming();
      result.current.setDraftName('  Deep Work  ');
    });

    await act(async () => {
      await result.current.saveName();
    });

    expect(onRenameMode).toHaveBeenCalledWith('mode-1', 'Deep Work');
    expect(result.current.isRenaming).toBe(false);
    expect(result.current.isSavingName).toBe(false);
  });

  it('keeps rename mode open while a save is pending', async () => {
    let resolveRename: (value: unknown) => void = () => {};
    const onRenameMode = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveRename = resolve;
        })
    );
    const { result } = renderHook(() =>
      useModeRename({
        modeId: 'mode-1',
        name: 'Focus',
        onRenameMode
      })
    );

    act(() => {
      result.current.startRenaming();
      result.current.setDraftName('Deep Work');
    });

    let savePromise: Promise<void> = Promise.resolve();

    act(() => {
      savePromise = result.current.saveName();
    });

    expect(result.current.isRenaming).toBe(true);
    expect(result.current.isSavingName).toBe(true);

    await act(async () => {
      resolveRename({ id: 'mode-1' });
      await savePromise;
    });

    expect(result.current.isRenaming).toBe(false);
    expect(result.current.isSavingName).toBe(false);
  });

  it('does not save blank names', async () => {
    const onRenameMode = vi.fn().mockResolvedValue({ id: 'mode-1' });
    const { result } = renderHook(() =>
      useModeRename({
        modeId: 'mode-1',
        name: 'Focus',
        onRenameMode
      })
    );

    act(() => {
      result.current.startRenaming();
      result.current.setDraftName('   ');
    });

    await act(async () => {
      await result.current.saveName();
    });

    expect(result.current.canSaveName).toBe(false);
    expect(result.current.isRenaming).toBe(true);
    expect(onRenameMode).not.toHaveBeenCalled();
  });

  it('exits rename mode without saving unchanged names', async () => {
    const onRenameMode = vi.fn().mockResolvedValue({ id: 'mode-1' });
    const { result } = renderHook(() =>
      useModeRename({
        modeId: 'mode-1',
        name: 'Focus',
        onRenameMode
      })
    );

    act(() => {
      result.current.startRenaming();
    });

    await act(async () => {
      await result.current.saveName();
    });

    expect(result.current.isRenaming).toBe(false);
    expect(onRenameMode).not.toHaveBeenCalled();
  });

  it('cancels renaming and restores the current name as the draft', () => {
    const onRenameMode = vi.fn().mockResolvedValue({ id: 'mode-1' });
    const { result } = renderHook(() =>
      useModeRename({
        modeId: 'mode-1',
        name: 'Focus',
        onRenameMode
      })
    );

    act(() => {
      result.current.startRenaming();
      result.current.setDraftName('Deep Work');
      result.current.cancelRenaming();
    });

    expect(result.current.draftName).toBe('Focus');
    expect(result.current.isRenaming).toBe(false);
    expect(onRenameMode).not.toHaveBeenCalled();
  });

  it('focuses and selects the rename input when rename mode opens', async () => {
    const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame');
    const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = render(<RenameHarness />);

    fireEvent.click(screen.getByRole('button', { name: /^rename$/i }));

    const input = screen.getByLabelText('Mode name') as HTMLInputElement;

    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
    expect(requestAnimationFrame).toHaveBeenCalled();

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
