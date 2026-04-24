import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildAppData } from '@test/builders/main/persistence';
import {
  buildOpenAppModeAction,
  buildOpenAppModeActionInput
} from '@test/builders/shared/modes';
import { MODE_NAME_MAX_LENGTH } from '@shared/modes';
import { AppDataStore } from '../persistence/app-data-store';
import { CURRENT_APP_DATA_SCHEMA_VERSION, type AppData } from '../persistence/types';
import { ModeService, ModeServiceError, NO_ACTIVE_MODE_LABEL } from './mode-service';

const createAppData = (): AppData => buildAppData();

describe('ModeService', () => {
  let userDataPath: string;
  let store: AppDataStore;
  let service: ModeService;

  beforeEach(async () => {
    userDataPath = await mkdtemp(path.join(tmpdir(), 'nightward-modes-'));
    store = new AppDataStore({ userDataPath });
    service = new ModeService(store);
  });

  afterEach(async () => {
    await rm(userDataPath, { recursive: true, force: true });
  });

  it('initializes saved modes from persisted app data', async () => {
    await store.write(createAppData());

    await service.initialize();

    expect(service.getSavedModes(5)).toEqual([
      {
        actions: {
          enter: [],
          exit: []
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        id: 'mode-1',
        name: 'Focus',
        pinnedAt: null,
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]);
  });

  it('initializes active mode state from persisted app data', async () => {
    await store.write({
      ...createAppData(),
      activeModeId: 'mode-1'
    });

    await service.initialize();

    expect(service.getCurrentModeLabel()).toBe('Focus');
    expect(service.getModeState()).toEqual({
      activeModeId: 'mode-1',
      modes: [
        {
          actions: {
            enter: [],
            exit: []
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          id: 'mode-1',
          name: 'Focus',
          pinnedAt: null,
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
    });
  });

  it('creates a mode and persists it', async () => {
    await service.initialize();

    const createdMode = await service.createMode('  Deep Work  ');
    const persistedData = await store.read();

    expect(createdMode.id).toEqual(expect.any(String));
    expect(createdMode.actions).toEqual({
      enter: [],
      exit: []
    });
    expect(createdMode.name).toBe('Deep Work');
    expect(Date.parse(createdMode.createdAt)).not.toBeNaN();
    expect(createdMode.pinnedAt).toBeNull();
    expect(createdMode.updatedAt).toBe(createdMode.createdAt);
    expect(persistedData.modes).toHaveLength(1);
    expect(persistedData.modes[0]).toMatchObject({
      id: createdMode.id,
      name: 'Deep Work'
    });
    expect(Date.parse(persistedData.modes[0].createdAt)).not.toBeNaN();
    expect(persistedData.modes[0].updatedAt).toBe(persistedData.modes[0].createdAt);
  });

  it('rejects blank mode names when creating a mode', async () => {
    await service.initialize();

    await expect(service.createMode('   ')).rejects.toBeInstanceOf(ModeServiceError);
    await expect(store.read()).resolves.toEqual({
      activeModeId: null,
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: []
    });
  });

  it('rejects mode names longer than the maximum length', async () => {
    await service.initialize();

    await expect(service.createMode('a'.repeat(MODE_NAME_MAX_LENGTH + 1))).rejects.toThrow(
      `Mode name must be ${MODE_NAME_MAX_LENGTH} characters or less.`
    );
    await expect(store.read()).resolves.toEqual({
      activeModeId: null,
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: []
    });
  });

  it('rejects renamed mode names longer than the maximum length', async () => {
    await store.write(createAppData());
    await service.initialize();

    await expect(
      service.renameMode('mode-1', 'a'.repeat(MODE_NAME_MAX_LENGTH + 1))
    ).rejects.toThrow(`Mode name must be ${MODE_NAME_MAX_LENGTH} characters or less.`);

    await expect(store.read()).resolves.toEqual(createAppData());
  });

  it('renames a mode and persists the updated timestamp', async () => {
    await store.write(createAppData());
    await service.initialize();

    const renamedMode = await service.renameMode('mode-1', '  Deep Work  ');
    const persistedData = await store.read();

    expect(renamedMode).toEqual({
      actions: {
        enter: [],
        exit: []
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      id: 'mode-1',
      name: 'Deep Work',
      pinnedAt: null,
      updatedAt: persistedData.modes[0].updatedAt
    });
    expect(persistedData.modes[0]).toMatchObject({
      id: 'mode-1',
      name: 'Deep Work',
      createdAt: '2024-01-01T00:00:00.000Z'
    });
    expect(persistedData.modes[0].updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
  });

  it('pins and unpins a mode', async () => {
    await store.write(createAppData());
    await service.initialize();

    const pinnedMode = await service.setModePinned('mode-1', true);
    const pinnedData = await store.read();

    expect(pinnedMode).toMatchObject({
      id: 'mode-1',
      name: 'Focus'
    });
    expect(pinnedMode?.pinnedAt).not.toBeNull();
    expect(pinnedData.modes[0].pinnedAt).toBe(pinnedMode?.pinnedAt);

    const unpinnedMode = await service.setModePinned('mode-1', false);

    expect(unpinnedMode?.pinnedAt).toBeNull();
    await expect(store.read()).resolves.toMatchObject({
      modes: [
        {
          id: 'mode-1',
          pinnedAt: null
        }
      ]
    });
  });

  it('returns null when pinning a missing mode', async () => {
    await service.initialize();

    await expect(service.setModePinned('missing-mode', true)).resolves.toBeNull();
  });

  it('returns null when renaming a missing mode', async () => {
    await service.initialize();

    await expect(service.renameMode('missing-mode', 'Focus')).resolves.toBeNull();
  });

  it('creates a mode action and persists it', async () => {
    await store.write(createAppData());
    await service.initialize();

    const createdMode = await service.createModeAction(
      'mode-1',
      'enter',
      buildOpenAppModeActionInput({ appName: 'Notes' })
    );
    const persistedData = await store.read();

    expect(createdMode).toMatchObject({
      id: 'mode-1',
      actions: {
        enter: [
          {
            appName: 'Notes',
            appPath: '/Applications/Calendar.app',
            enabled: true,
            onlyOpenIfNotRunning: false,
            repeatPolicy: 'every-activation',
            type: 'open-app'
          }
        ],
        exit: []
      }
    });
    expect(createdMode?.actions.enter[0]?.id).toEqual(expect.any(String));
    expect(persistedData.modes[0].actions.enter).toHaveLength(1);
    expect(persistedData.modes[0].updatedAt).toBe(createdMode?.updatedAt);
  });

  it('updates a mode action and preserves its identifier', async () => {
    await store.write(
      buildAppData({
        modes: [
          {
            ...createAppData().modes[0],
            actions: {
              enter: [buildOpenAppModeAction()],
              exit: []
            }
          }
        ]
      })
    );
    await service.initialize();

    const updatedMode = await service.updateModeAction(
      'mode-1',
      'enter',
      'action-1',
      buildOpenAppModeActionInput({
        appName: 'Mail',
        onlyOpenIfNotRunning: true,
        repeatPolicy: 'once-per-day'
      })
    );

    expect(updatedMode).toMatchObject({
      actions: {
        enter: [
          {
            id: 'action-1',
            appName: 'Mail',
            onlyOpenIfNotRunning: true,
            repeatPolicy: 'once-per-day'
          }
        ]
      }
    });
  });

  it('deletes a mode action and persists the updated mode', async () => {
    await store.write(
      buildAppData({
        modes: [
          {
            ...createAppData().modes[0],
            actions: {
              enter: [buildOpenAppModeAction()],
              exit: []
            }
          }
        ]
      })
    );
    await service.initialize();

    const updatedMode = await service.deleteModeAction('mode-1', 'enter', 'action-1');
    const persistedData = await store.read();

    expect(updatedMode?.actions.enter).toEqual([]);
    expect(persistedData.modes[0].actions.enter).toEqual([]);
  });

  it('returns null when updating a missing mode action', async () => {
    await store.write(createAppData());
    await service.initialize();

    await expect(
      service.updateModeAction('mode-1', 'enter', 'missing-action', buildOpenAppModeActionInput())
    ).resolves.toBeNull();
  });

  it('deletes a mode, persists the removal, and clears the active mode', async () => {
    await store.write(createAppData());
    await service.initialize();
    await expect(service.activateSavedMode('mode-1')).resolves.toBe(true);

    expect(service.getCurrentModeLabel()).toBe('Focus');
    await expect(service.deleteMode('mode-1')).resolves.toBe(true);

    expect(service.getCurrentModeLabel()).toBe(NO_ACTIVE_MODE_LABEL);
    await expect(store.read()).resolves.toEqual({
      activeModeId: null,
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: []
    });
  });

  it('returns false when deleting a missing mode', async () => {
    await service.initialize();

    await expect(service.deleteMode('missing-mode')).resolves.toBe(false);
  });

  it('returns false when activating a missing mode', async () => {
    await service.initialize();

    await expect(service.activateSavedMode('missing-mode')).resolves.toBe(false);
    expect(service.getCurrentModeLabel()).toBe(NO_ACTIVE_MODE_LABEL);
  });

  it('activates a saved mode and persists it', async () => {
    await store.write(createAppData());
    await service.initialize();

    await expect(service.activateSavedMode('mode-1')).resolves.toBe(true);

    expect(service.getCurrentModeLabel()).toBe('Focus');
    await expect(store.read()).resolves.toMatchObject({
      activeModeId: 'mode-1'
    });
  });

  it('deactivates the active mode and persists it', async () => {
    await store.write(createAppData());
    await service.initialize();
    await service.activateSavedMode('mode-1');

    await expect(service.deactivateActiveMode()).resolves.toBe(true);

    expect(service.getCurrentModeLabel()).toBe(NO_ACTIVE_MODE_LABEL);
    await expect(store.read()).resolves.toMatchObject({
      activeModeId: null
    });
  });

  it('returns false when deactivating with no active mode', async () => {
    await store.write(createAppData());
    await service.initialize();

    await expect(service.deactivateActiveMode()).resolves.toBe(false);
    await expect(store.read()).resolves.toMatchObject({
      activeModeId: null
    });
  });
});
