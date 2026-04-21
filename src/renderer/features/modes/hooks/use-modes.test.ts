// @vitest-environment happy-dom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ModeState, SavedMode } from '../../../../shared/modes';
import { clearApiMock, installApiMock } from '../../../test/api-test-utils';
import { useModes } from './use-modes';

const createModeState = (modes: SavedMode[], activeModeId: string | null = null): ModeState => ({
  activeModeId,
  modes
});

describe('useModes', () => {
  afterEach(() => {
    cleanup();
    clearApiMock();
    vi.restoreAllMocks();
  });

  it('loads mode state from the preload bridge on mount', async () => {
    const modes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const getState = vi.fn().mockResolvedValue(createModeState(modes, 'mode-1'));
    installApiMock({ modes: { getState } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeModeId).toBe('mode-1');
    expect(result.current.error).toBeNull();
    expect(result.current.modes).toEqual(modes);
    expect(getState).toHaveBeenCalledOnce();
  });

  it('stores an error message and clears mode state when loading fails', async () => {
    const getState = vi.fn().mockRejectedValue(new Error('Bridge unavailable'));
    installApiMock({ modes: { getState } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeModeId).toBeNull();
    expect(result.current.error).toBe('Bridge unavailable');
    expect(result.current.modes).toEqual([]);
  });

  it('uses a fallback error message for non-error failures', async () => {
    const getState = vi.fn().mockRejectedValue('nope');
    installApiMock({ modes: { getState } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.error).toBe('Unable to load modes.'));
  });

  it('refreshes mode state on demand', async () => {
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
    const getState = vi
      .fn()
      .mockResolvedValueOnce(createModeState(firstModes))
      .mockResolvedValueOnce(createModeState(nextModes, 'mode-2'));
    installApiMock({ modes: { getState } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual(firstModes));

    await act(async () => {
      await result.current.refreshModes();
    });

    expect(result.current.activeModeId).toBe('mode-2');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(nextModes);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('creates a mode and refreshes mode state', async () => {
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
    const getState = vi
      .fn()
      .mockResolvedValueOnce(createModeState(firstModes, 'mode-1'))
      .mockResolvedValueOnce(createModeState(nextModes, 'mode-1'));
    const create = vi.fn().mockResolvedValue(createdMode);
    installApiMock({ modes: { create, getState } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual(firstModes));

    let response: SavedMode | null = null;

    await act(async () => {
      response = await result.current.createMode('Deep Work');
    });

    expect(create).toHaveBeenCalledWith('Deep Work');
    expect(response).toEqual(createdMode);
    expect(result.current.activeModeId).toBe('mode-1');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(nextModes);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('renames a mode and refreshes mode state', async () => {
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
    const getState = vi
      .fn()
      .mockResolvedValueOnce(createModeState(firstModes, 'mode-1'))
      .mockResolvedValueOnce(createModeState([renamedMode], 'mode-1'));
    const rename = vi.fn().mockResolvedValue(renamedMode);
    installApiMock({ modes: { getState, rename } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual(firstModes));

    let response: SavedMode | null = null;

    await act(async () => {
      response = await result.current.renameMode('mode-1', 'Writing');
    });

    expect(rename).toHaveBeenCalledWith('mode-1', 'Writing');
    expect(response).toEqual(renamedMode);
    expect(result.current.activeModeId).toBe('mode-1');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual([renamedMode]);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('deletes a mode and refreshes mode state', async () => {
    const deletedMode = {
      id: 'mode-1',
      name: 'Focus'
    };
    const getState = vi
      .fn()
      .mockResolvedValueOnce(createModeState([deletedMode], 'mode-1'))
      .mockResolvedValueOnce(createModeState([]));
    const deleteMode = vi.fn().mockResolvedValue(true);
    installApiMock({ modes: { delete: deleteMode, getState } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual([deletedMode]));

    let response = false;

    await act(async () => {
      response = await result.current.deleteMode('mode-1');
    });

    expect(deleteMode).toHaveBeenCalledWith('mode-1');
    expect(response).toBe(true);
    expect(result.current.activeModeId).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual([]);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('activates a mode and refreshes mode state', async () => {
    const modes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const getState = vi
      .fn()
      .mockResolvedValueOnce(createModeState(modes))
      .mockResolvedValueOnce(createModeState(modes, 'mode-1'));
    const activate = vi.fn().mockResolvedValue(true);
    installApiMock({ modes: { activate, getState } });

    const { result } = renderHook(() => useModes());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    let response = false;

    await act(async () => {
      response = await result.current.activateMode('mode-1');
    });

    expect(activate).toHaveBeenCalledWith('mode-1');
    expect(response).toBe(true);
    expect(result.current.activeModeId).toBe('mode-1');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(modes);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('stores an error and keeps current mode state when a mutation fails', async () => {
    const modes = [
      {
        id: 'mode-1',
        name: 'Focus'
      }
    ];
    const getState = vi.fn().mockResolvedValue(createModeState(modes, 'mode-1'));
    const create = vi.fn().mockRejectedValue(new Error('Mode name already exists'));
    installApiMock({ modes: { create, getState } });

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
    expect(result.current.activeModeId).toBe('mode-1');
    expect(result.current.error).toBe('Mode name already exists');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(modes);
    expect(getState).toHaveBeenCalledOnce();
  });
});
