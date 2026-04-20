// @vitest-environment happy-dom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SavedMode } from '../../shared/modes';
import { clearApiMock, installApiMock } from '../test/api-test-utils';
import { useModes } from './use-modes';

describe('useModes', () => {
  afterEach(() => {
    cleanup();
    clearApiMock();
    vi.restoreAllMocks();
  });

  it('loads modes from the preload bridge on mount', async () => {
    const modes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const list = vi.fn().mockResolvedValue(modes);
    installApiMock({ modes: { list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.modes).toEqual(modes);
    expect(list).toHaveBeenCalledOnce();
  });

  it('stores an error message and clears modes when loading fails', async () => {
    const list = vi.fn().mockRejectedValue(new Error('Bridge unavailable'));
    installApiMock({ modes: { list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Bridge unavailable');
    expect(result.current.modes).toEqual([]);
  });

  it('uses a fallback error message for non-error failures', async () => {
    const list = vi.fn().mockRejectedValue('nope');
    installApiMock({ modes: { list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.error).toBe('Unable to load modes.'));
  });

  it('refreshes modes on demand', async () => {
    const firstModes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const nextModes = [
      ...firstModes,
      {
        id: 'mode-2',
        name: 'Deep Work'
      }
    ];
    const list = vi.fn().mockResolvedValueOnce(firstModes).mockResolvedValueOnce(nextModes);
    installApiMock({ modes: { list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual(firstModes));

    await act(async () => {
      await result.current.refreshModes();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(nextModes);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('creates a mode and refreshes modes', async () => {
    const firstModes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const createdMode = {
      id: 'mode-2',
      name: 'Deep Work'
    };
    const nextModes = [...firstModes, createdMode];
    const list = vi.fn().mockResolvedValueOnce(firstModes).mockResolvedValueOnce(nextModes);
    const create = vi.fn().mockResolvedValue(createdMode);
    installApiMock({ modes: { create, list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual(firstModes));

    let response: SavedMode | null = null;

    await act(async () => {
      response = await result.current.createMode('Deep Work');
    });

    expect(create).toHaveBeenCalledWith('Deep Work');
    expect(response).toEqual(createdMode);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(nextModes);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('renames a mode and refreshes modes', async () => {
    const firstModes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const renamedMode = {
      id: 'mode-1',
      name: 'Writing'
    };
    const list = vi.fn().mockResolvedValueOnce(firstModes).mockResolvedValueOnce([renamedMode]);
    const rename = vi.fn().mockResolvedValue(renamedMode);
    installApiMock({ modes: { list, rename } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual(firstModes));

    let response: SavedMode | null = null;

    await act(async () => {
      response = await result.current.renameMode('mode-1', 'Writing');
    });

    expect(rename).toHaveBeenCalledWith('mode-1', 'Writing');
    expect(response).toEqual(renamedMode);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual([renamedMode]);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('deletes a mode and refreshes modes', async () => {
    const deletedMode = {
      id: 'mode-1',
      name: 'Focus'
    };
    const list = vi.fn().mockResolvedValueOnce([deletedMode]).mockResolvedValueOnce([]);
    const deleteMode = vi.fn().mockResolvedValue(true);
    installApiMock({ modes: { delete: deleteMode, list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual([deletedMode]));

    let response = false;

    await act(async () => {
      response = await result.current.deleteMode('mode-1');
    });

    expect(deleteMode).toHaveBeenCalledWith('mode-1');
    expect(response).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual([]);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('activates a mode and refreshes modes', async () => {
    const modes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const list = vi.fn().mockResolvedValue(modes);
    const activate = vi.fn().mockResolvedValue(true);
    installApiMock({ modes: { activate, list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    let response = false;

    await act(async () => {
      response = await result.current.activateMode('mode-1');
    });

    expect(activate).toHaveBeenCalledWith('mode-1');
    expect(response).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(modes);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('stores an error and keeps current modes when a mutation fails', async () => {
    const modes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const list = vi.fn().mockResolvedValue(modes);
    const create = vi.fn().mockRejectedValue(new Error('Mode name already exists'));
    installApiMock({ modes: { create, list } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    let response: SavedMode | null = {
      id: 'stale',
      name: 'Stale'
    };

    await act(async () => {
      response = await result.current.createMode('Focus');
    });

    expect(create).toHaveBeenCalledWith('Focus');
    expect(response).toBeNull();
    expect(result.current.error).toBe('Mode name already exists');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(modes);
    expect(list).toHaveBeenCalledOnce();
  });
});
