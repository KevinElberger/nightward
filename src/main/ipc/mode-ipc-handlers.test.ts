import type { IpcMain } from 'electron';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MODE_IPC_CHANNELS } from '../../shared/mode-ipc';
import { ModeService } from '../modes/mode-service';
import { AppDataStore } from '../persistence/app-data-store';
import { registerModeIpcHandlers, ModeIpcHandlerError } from './mode-ipc-handlers';

type IpcHandler = (event: unknown, request?: unknown) => unknown;

const createFakeIpcMain = () => {
  const handlers = new Map<string, IpcHandler>();
  const ipcMain = {
    handle: vi.fn((channel: string, handler: IpcHandler) => {
      handlers.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlers.delete(channel);
    })
  };

  const invoke = async <Response>(channel: string, request?: unknown) => {
    const handler = handlers.get(channel);

    if (handler === undefined) {
      throw new Error(`No IPC handler registered for ${channel}.`);
    }

    return (await handler({}, request)) as Response;
  };

  return {
    handlers,
    ipcMain: ipcMain as unknown as Pick<IpcMain, 'handle' | 'removeHandler'>,
    invoke
  };
};

describe('registerModeIpcHandlers', () => {
  let userDataPath: string;
  let modeService: ModeService;

  beforeEach(async () => {
    userDataPath = await mkdtemp(path.join(tmpdir(), 'nightward-mode-ipc-'));
    modeService = new ModeService(new AppDataStore({ userDataPath }));
    await modeService.initialize();
  });

  afterEach(async () => {
    await rm(userDataPath, { recursive: true, force: true });
  });

  it('registers and unregisters all mode channels', () => {
    const { handlers, ipcMain } = createFakeIpcMain();
    const unregister = registerModeIpcHandlers({
      ipcMain,
      modeService,
      onModesChanged: vi.fn()
    });

    expect([...handlers.keys()].sort()).toEqual(Object.values(MODE_IPC_CHANNELS).sort());

    unregister();

    expect(handlers.size).toBe(0);
    expect(ipcMain.removeHandler).toHaveBeenCalledTimes(Object.values(MODE_IPC_CHANNELS).length);
  });

  it('creates modes and refreshes mode consumers', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    const onModesChanged = vi.fn();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged });

    const createdMode = await invoke(MODE_IPC_CHANNELS.create, {
      name: '  Focus  '
    });

    expect(createdMode).toMatchObject({
      id: expect.any(String),
      name: 'Focus'
    });
    expect(modeService.getSavedModes()).toEqual([createdMode]);
    expect(onModesChanged).toHaveBeenCalledOnce();
  });

  it('lists modes', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged: vi.fn() });
    const createdMode = await modeService.createMode('Focus');

    await expect(invoke(MODE_IPC_CHANNELS.list)).resolves.toEqual([createdMode]);
  });

  it('gets mode state', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged: vi.fn() });
    const createdMode = await modeService.createMode('Focus');
    await modeService.activateSavedMode(createdMode.id);

    await expect(invoke(MODE_IPC_CHANNELS.getState)).resolves.toEqual({
      activeModeId: createdMode.id,
      modes: [createdMode]
    });
  });

  it('renames modes and refreshes mode consumers', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    const onModesChanged = vi.fn();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged });
    const createdMode = await modeService.createMode('Focus');

    const renamedMode = await invoke(MODE_IPC_CHANNELS.rename, {
      id: createdMode.id,
      name: 'Deep Work'
    });

    expect(renamedMode).toMatchObject({
      id: createdMode.id,
      name: 'Deep Work'
    });
    expect((renamedMode as { createdAt: string }).createdAt).toBe(createdMode.createdAt);
    expect(Date.parse((renamedMode as { updatedAt: string }).updatedAt)).not.toBeNaN();
    expect(onModesChanged).toHaveBeenCalledOnce();
  });

  it('pins modes and refreshes mode consumers', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    const onModesChanged = vi.fn();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged });
    const createdMode = await modeService.createMode('Focus');

    const pinnedMode = await invoke(MODE_IPC_CHANNELS.setPinned, {
      id: createdMode.id,
      isPinned: true
    });

    expect(pinnedMode).toMatchObject({
      id: createdMode.id,
      name: 'Focus'
    });
    expect((pinnedMode as { pinnedAt: string | null }).pinnedAt).not.toBeNull();
    expect(onModesChanged).toHaveBeenCalledOnce();
  });

  it('does not refresh mode consumers when pinning a missing mode', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    const onModesChanged = vi.fn();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged });

    await expect(
      invoke(MODE_IPC_CHANNELS.setPinned, {
        id: 'missing-mode',
        isPinned: true
      })
    ).resolves.toBeNull();

    expect(onModesChanged).not.toHaveBeenCalled();
  });

  it('deletes modes and refreshes mode consumers', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    const onModesChanged = vi.fn();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged });
    const createdMode = await modeService.createMode('Focus');

    await expect(
      invoke(MODE_IPC_CHANNELS.delete, {
        id: createdMode.id
      })
    ).resolves.toBe(true);
    expect(modeService.getSavedModes()).toEqual([]);
    expect(onModesChanged).toHaveBeenCalledOnce();
  });

  it('activates modes and refreshes mode consumers', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    const onModesChanged = vi.fn();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged });
    const createdMode = await modeService.createMode('Focus');

    await expect(
      invoke(MODE_IPC_CHANNELS.activate, {
        id: createdMode.id
      })
    ).resolves.toBe(true);
    expect(modeService.getCurrentModeLabel()).toBe('Focus');
    expect(onModesChanged).toHaveBeenCalledOnce();
  });

  it('deactivates modes and refreshes mode consumers', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    const onModesChanged = vi.fn();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged });
    const createdMode = await modeService.createMode('Focus');
    await modeService.activateSavedMode(createdMode.id);

    await expect(invoke(MODE_IPC_CHANNELS.deactivate)).resolves.toBe(true);

    expect(modeService.getModeState().activeModeId).toBeNull();
    expect(onModesChanged).toHaveBeenCalledOnce();
  });

  it('does not refresh mode consumers when there is no active mode to deactivate', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    const onModesChanged = vi.fn();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged });

    await expect(invoke(MODE_IPC_CHANNELS.deactivate)).resolves.toBe(false);

    expect(onModesChanged).not.toHaveBeenCalled();
  });

  it('rejects malformed payloads before calling mode service methods', async () => {
    const { ipcMain, invoke } = createFakeIpcMain();
    const onModesChanged = vi.fn();
    registerModeIpcHandlers({ ipcMain, modeService, onModesChanged });

    await expect(invoke(MODE_IPC_CHANNELS.create, { name: 12 })).rejects.toBeInstanceOf(
      ModeIpcHandlerError
    );
    expect(modeService.getSavedModes()).toEqual([]);
    expect(onModesChanged).not.toHaveBeenCalled();
  });
});
