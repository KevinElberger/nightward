import { describe, expect, it, vi } from 'vitest';
import { MODE_IPC_CHANNELS, MODE_IPC_EVENTS } from '../shared/mode-ipc';
import { buildModeState, buildSavedMode } from '@test/builders/shared/modes';
import { createNightwardApi } from './nightward-api';

const createIpcRendererMock = ({
  invoke = vi.fn(),
  on = vi.fn(),
  removeListener = vi.fn()
} = {}) => ({
  invoke,
  on,
  removeListener
});

describe('createNightwardApi', () => {
  it('invokes the get mode state channel', async () => {
    const modeState = buildModeState({
      activeModeId: 'mode-1',
      modes: [buildSavedMode()]
    });
    const invoke = vi.fn().mockResolvedValue(modeState);
    const api = createNightwardApi(createIpcRendererMock({ invoke }));

    await expect(api.modes.getState()).resolves.toEqual(modeState);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.getState);
  });

  it('invokes the list modes channel', async () => {
    const invoke = vi.fn().mockResolvedValue([]);
    const api = createNightwardApi(createIpcRendererMock({ invoke }));

    await expect(api.modes.list()).resolves.toEqual([]);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.list);
  });

  it('invokes the create mode channel with a typed request payload', async () => {
    const createdMode = buildSavedMode();
    const invoke = vi.fn().mockResolvedValue(createdMode);
    const api = createNightwardApi(createIpcRendererMock({ invoke }));

    await expect(api.modes.create('Focus')).resolves.toEqual(createdMode);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.create, {
      name: 'Focus'
    });
  });

  it('invokes the rename mode channel with a typed request payload', async () => {
    const renamedMode = buildSavedMode({ name: 'Deep Work' });
    const invoke = vi.fn().mockResolvedValue(renamedMode);
    const api = createNightwardApi(createIpcRendererMock({ invoke }));

    await expect(api.modes.rename('mode-1', 'Deep Work')).resolves.toEqual(renamedMode);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.rename, {
      id: 'mode-1',
      name: 'Deep Work'
    });
  });

  it('invokes the set pinned mode channel with a typed request payload', async () => {
    const pinnedMode = {
      ...buildSavedMode(),
      pinnedAt: '2026-04-21T12:00:00.000Z'
    };
    const invoke = vi.fn().mockResolvedValue(pinnedMode);
    const api = createNightwardApi(createIpcRendererMock({ invoke }));

    await expect(api.modes.setPinned('mode-1', true)).resolves.toEqual(pinnedMode);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.setPinned, {
      id: 'mode-1',
      isPinned: true
    });
  });

  it('invokes the delete mode channel with a typed request payload', async () => {
    const invoke = vi.fn().mockResolvedValue(true);
    const api = createNightwardApi(createIpcRendererMock({ invoke }));

    await expect(api.modes.delete('mode-1')).resolves.toBe(true);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.delete, {
      id: 'mode-1'
    });
  });

  it('invokes the activate mode channel with a typed request payload', async () => {
    const invoke = vi.fn().mockResolvedValue(true);
    const api = createNightwardApi(createIpcRendererMock({ invoke }));

    await expect(api.modes.activate('mode-1')).resolves.toBe(true);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.activate, {
      id: 'mode-1'
    });
  });

  it('invokes the deactivate mode channel', async () => {
    const invoke = vi.fn().mockResolvedValue(true);
    const api = createNightwardApi(createIpcRendererMock({ invoke }));

    await expect(api.modes.deactivate()).resolves.toBe(true);

    expect(invoke).toHaveBeenCalledWith(MODE_IPC_CHANNELS.deactivate);
  });

  it('subscribes to mode state change events and returns an unsubscribe callback', () => {
    const modeState = buildModeState({
      activeModeId: 'mode-1',
      modes: [buildSavedMode()]
    });
    const listener = vi.fn();
    const on = vi.fn();
    const removeListener = vi.fn();
    const api = createNightwardApi(createIpcRendererMock({ on, removeListener }));

    const unsubscribe = api.modes.onChanged(listener);
    const ipcListener = on.mock.calls[0]?.[1];

    expect(on).toHaveBeenCalledWith(MODE_IPC_EVENTS.stateChanged, expect.any(Function));

    ipcListener?.({}, modeState);

    expect(listener).toHaveBeenCalledWith(modeState);

    unsubscribe();

    expect(removeListener).toHaveBeenCalledWith(MODE_IPC_EVENTS.stateChanged, ipcListener);
  });
});
