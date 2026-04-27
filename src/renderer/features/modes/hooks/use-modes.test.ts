// @vitest-environment happy-dom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildModeState,
  buildOpenAppModeActionInput,
  buildSavedMode
} from '@test/builders/shared/modes';
import { createModeAutomationResult } from '../../../../shared/mode-automation';
import { clearApiMock, installApiMock } from '../../../test/api-test-utils';
import { useModesState } from './use-modes';
import type { ModeState, SavedMode } from '../../../../shared/modes';
import type { ActivateModeResponse } from '../../../../shared/mode-ipc';

const sonnerMock = vi.hoisted(() => ({
  error: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: sonnerMock
}));

describe('useModesState', () => {
  afterEach(() => {
    cleanup();
    clearApiMock();
    sonnerMock.error.mockClear();
    vi.restoreAllMocks();
  });

  it('loads mode state from the preload bridge on mount', async () => {
    const modes = [buildSavedMode()];
    const getState = vi.fn().mockResolvedValue(buildModeState({ activeModeId: 'mode-1', modes }));
    installApiMock({ modes: { getState } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeModeId).toBe('mode-1');
    expect(result.current.error).toBeNull();
    expect(result.current.modes).toEqual(modes);
    expect(getState).toHaveBeenCalledOnce();
  });

  it('stores an error message and clears mode state when loading fails', async () => {
    const getState = vi.fn().mockRejectedValue(new Error('Bridge unavailable'));
    installApiMock({ modes: { getState } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeModeId).toBeNull();
    expect(result.current.error).toBe('Bridge unavailable');
    expect(result.current.modes).toEqual([]);
  });

  it('uses a fallback error message for non-error failures', async () => {
    const getState = vi.fn().mockRejectedValue('nope');
    installApiMock({ modes: { getState } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.error).toBe('Unable to load modes.'));
  });

  it('refreshes mode state on demand', async () => {
    const firstModes = [buildSavedMode()];
    const nextModes = [...firstModes, buildSavedMode({ id: 'mode-2', name: 'Deep Work' })];
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ modes: firstModes }))
      .mockResolvedValueOnce(buildModeState({ activeModeId: 'mode-2', modes: nextModes }));
    installApiMock({ modes: { getState } });

    const { result } = renderHook(() => useModesState());

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

  it('updates mode state from preload change events', async () => {
    const firstModes = [buildSavedMode()];
    const nextModes = [...firstModes, buildSavedMode({ id: 'mode-2', name: 'Deep Work' })];
    const getState = vi.fn().mockResolvedValue(buildModeState({ modes: firstModes }));
    const unsubscribe = vi.fn();
    let emitModeStateChange: (modeState: ModeState) => void = () => {};
    const onChanged = vi.fn((listener: (modeState: ModeState) => void) => {
      emitModeStateChange = listener;

      return unsubscribe;
    });
    installApiMock({ modes: { getState, onChanged } });

    const { result, unmount } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.modes).toEqual(firstModes));

    act(() => {
      emitModeStateChange(buildModeState({ activeModeId: 'mode-2', modes: nextModes }));
    });

    expect(result.current.activeModeId).toBe('mode-2');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(nextModes);
    expect(getState).toHaveBeenCalledOnce();

    unmount();

    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('creates a mode and refreshes mode state', async () => {
    const firstModes = [buildSavedMode()];
    const createdMode = buildSavedMode({ id: 'mode-2', name: 'Deep Work' });
    const nextModes = [...firstModes, createdMode];
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ activeModeId: 'mode-1', modes: firstModes }))
      .mockResolvedValueOnce(buildModeState({ activeModeId: 'mode-1', modes: nextModes }));
    const create = vi.fn().mockResolvedValue(createdMode);
    installApiMock({ modes: { create, getState } });

    const { result } = renderHook(() => useModesState());

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
    const firstModes = [buildSavedMode()];
    const renamedMode = buildSavedMode({ name: 'Writing' });
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ activeModeId: 'mode-1', modes: firstModes }))
      .mockResolvedValueOnce(buildModeState({ activeModeId: 'mode-1', modes: [renamedMode] }));
    const rename = vi.fn().mockResolvedValue(renamedMode);
    installApiMock({ modes: { getState, rename } });

    const { result } = renderHook(() => useModesState());

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
    const deletedMode = buildSavedMode();
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ activeModeId: 'mode-1', modes: [deletedMode] }))
      .mockResolvedValueOnce(buildModeState());
    const deleteMode = vi.fn().mockResolvedValue(true);
    installApiMock({ modes: { delete: deleteMode, getState } });

    const { result } = renderHook(() => useModesState());

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

  it('pins a mode and refreshes mode state', async () => {
    const modes = [buildSavedMode()];
    const pinnedMode = {
      ...modes[0],
      pinnedAt: '2026-04-21T12:00:00.000Z',
      updatedAt: '2026-04-21T12:00:00.000Z'
    };
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ modes }))
      .mockResolvedValueOnce(buildModeState({ modes: [pinnedMode] }));
    const setPinned = vi.fn().mockResolvedValue(pinnedMode);
    installApiMock({ modes: { getState, setPinned } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    let response: SavedMode | null = null;

    await act(async () => {
      response = await result.current.setModePinned('mode-1', true);
    });

    expect(setPinned).toHaveBeenCalledWith('mode-1', true);
    expect(response).toEqual(pinnedMode);
    expect(result.current.modes).toEqual([pinnedMode]);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('creates a mode action and refreshes mode state', async () => {
    const modes = [buildSavedMode()];
    const updatedMode = buildSavedMode();
    const action = buildOpenAppModeActionInput();
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ modes }))
      .mockResolvedValueOnce(buildModeState({ modes: [updatedMode] }));
    const createAction = vi.fn().mockResolvedValue(updatedMode);
    installApiMock({ modes: { createAction, getState } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    let response: SavedMode | null = null;

    await act(async () => {
      response = await result.current.createModeAction('mode-1', 'enter', action);
    });

    expect(createAction).toHaveBeenCalledWith('mode-1', 'enter', action);
    expect(response).toEqual(updatedMode);
    expect(result.current.modes).toEqual([updatedMode]);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('updates a mode action and refreshes mode state', async () => {
    const modes = [buildSavedMode()];
    const updatedMode = buildSavedMode();
    const action = buildOpenAppModeActionInput({ appName: 'Mail' });
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ modes }))
      .mockResolvedValueOnce(buildModeState({ modes: [updatedMode] }));
    const updateAction = vi.fn().mockResolvedValue(updatedMode);
    installApiMock({ modes: { getState, updateAction } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    let response: SavedMode | null = null;

    await act(async () => {
      response = await result.current.updateModeAction('mode-1', 'enter', 'action-1', action);
    });

    expect(updateAction).toHaveBeenCalledWith('mode-1', 'enter', 'action-1', action);
    expect(response).toEqual(updatedMode);
    expect(result.current.modes).toEqual([updatedMode]);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('deletes a mode action and refreshes mode state', async () => {
    const modes = [buildSavedMode()];
    const updatedMode = buildSavedMode();
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ modes }))
      .mockResolvedValueOnce(buildModeState({ modes: [updatedMode] }));
    const deleteAction = vi.fn().mockResolvedValue(updatedMode);
    installApiMock({ modes: { deleteAction, getState } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    let response: SavedMode | null = null;

    await act(async () => {
      response = await result.current.deleteModeAction('mode-1', 'enter', 'action-1');
    });

    expect(deleteAction).toHaveBeenCalledWith('mode-1', 'enter', 'action-1');
    expect(response).toEqual(updatedMode);
    expect(result.current.modes).toEqual([updatedMode]);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('keeps existing mode state visible while a mutation is pending', async () => {
    const modes = [buildSavedMode()];
    let resolveActivate: (value: ActivateModeResponse) => void = () => {};
    const activate = vi.fn(
      () =>
        new Promise<ActivateModeResponse>((resolve) => {
          resolveActivate = resolve;
        })
    );
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ modes }))
      .mockResolvedValueOnce(buildModeState({ activeModeId: 'mode-1', modes }));
    installApiMock({ modes: { activate, getState } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    let responsePromise = Promise.resolve(false);

    await act(async () => {
      responsePromise = result.current.activateMode('mode-1');
    });

    expect(activate).toHaveBeenCalledWith('mode-1');
    expect(result.current.activeModeId).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(modes);

    await act(async () => {
      resolveActivate(createModeAutomationResult(true));
      await responsePromise;
    });

    expect(result.current.activeModeId).toBe('mode-1');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(modes);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('activates a mode and refreshes mode state', async () => {
    const modes = [buildSavedMode()];
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ modes }))
      .mockResolvedValueOnce(buildModeState({ activeModeId: 'mode-1', modes }));
    const activate = vi.fn().mockResolvedValue(createModeAutomationResult(true));
    installApiMock({ modes: { activate, getState } });

    const { result } = renderHook(() => useModesState());

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

  it('deactivates a mode and refreshes mode state', async () => {
    const modes = [buildSavedMode()];
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ activeModeId: 'mode-1', modes }))
      .mockResolvedValueOnce(buildModeState({ modes }));
    const deactivate = vi.fn().mockResolvedValue(createModeAutomationResult(true));
    installApiMock({ modes: { deactivate, getState } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    let response = false;

    await act(async () => {
      response = await result.current.deactivateMode();
    });

    expect(deactivate).toHaveBeenCalledOnce();
    expect(response).toBe(true);
    expect(result.current.activeModeId).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modes).toEqual(modes);
    expect(getState).toHaveBeenCalledTimes(2);
  });

  it('stores an error and keeps current mode state when a mutation fails', async () => {
    const modes = [buildSavedMode()];
    const getState = vi.fn().mockResolvedValue(buildModeState({ activeModeId: 'mode-1', modes }));
    const create = vi.fn().mockRejectedValue(new Error('Mode name already exists'));
    installApiMock({ modes: { create, getState } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    let response: SavedMode | null = buildSavedMode({ id: 'stale', name: 'Stale' });

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

  it('shows a toast when mode activation actions fail', async () => {
    const modes = [buildSavedMode()];
    const getState = vi
      .fn()
      .mockResolvedValueOnce(buildModeState({ modes }))
      .mockResolvedValueOnce(buildModeState({ activeModeId: 'mode-1', modes }));
    const activate = vi.fn().mockResolvedValue(
      createModeAutomationResult(true, [
        {
          actionId: 'action-1',
          actionType: 'open-app',
          appName: 'Discord',
          message: 'Could not open app.',
          modeId: 'mode-1',
          modeName: 'Focus',
          phase: 'enter'
        }
      ])
    );
    installApiMock({ modes: { activate, getState } });

    const { result } = renderHook(() => useModesState());

    await waitFor(() => expect(result.current.modes).toEqual(modes));

    await act(async () => {
      await result.current.activateMode('mode-1');
    });

    expect(sonnerMock.error).toHaveBeenCalledWith("Couldn't open Discord.", {
      description: 'Could not open app.'
    });
  });
});
