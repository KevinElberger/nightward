import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildOpenAppModeAction } from '@test/builders/shared/modes';
import { buildAppData, buildPersistedMode } from '@test/builders/main/persistence';
import { AppDataStore, AppDataStoreError } from './app-data-store';
import { CURRENT_APP_DATA_SCHEMA_VERSION, createDefaultAppData, type AppData } from './types';

describe('AppDataStore', () => {
  let userDataPath: string;
  let store: AppDataStore;

  beforeEach(async () => {
    userDataPath = await mkdtemp(path.join(tmpdir(), 'nightward-store-'));
    store = new AppDataStore({ userDataPath });
  });

  afterEach(async () => {
    await rm(userDataPath, { recursive: true, force: true });
  });

  it('returns default app data when the file does not exist', async () => {
    await expect(store.read()).resolves.toEqual(createDefaultAppData());
  });

  it('round-trips valid app data through disk', async () => {
    const appData: AppData = buildAppData({
      modes: [
        buildPersistedMode({
          actions: {
            enter: [buildOpenAppModeAction()],
            exit: []
          }
        })
      ]
    });

    await store.write(appData);

    await expect(store.read()).resolves.toEqual(appData);
    await expect(readFile(store.filePath, 'utf8')).resolves.toContain('"modes"');
  });

  it('ignores legacy active mode IDs when reading app data', async () => {
    await writeFile(
      store.filePath,
      JSON.stringify({
        activeModeId: 'mode-1',
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: [buildPersistedMode()]
      }),
      'utf8'
    );

    await expect(store.read()).resolves.toEqual({
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: [buildPersistedMode()]
    });
  });

  it('hydrates missing mode timestamps for older app data files', async () => {
    await writeFile(
      store.filePath,
      JSON.stringify({
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: [
          {
            id: 'mode-1',
            name: 'Focus'
          }
        ]
      }),
      'utf8'
    );

    const appData = await store.read();

    expect(appData.modes[0]).toMatchObject({
      actions: {
        enter: [],
        exit: []
      },
      id: 'mode-1',
      name: 'Focus'
    });
    expect(Date.parse(appData.modes[0].createdAt)).not.toBeNaN();
    expect(appData.modes[0].pinnedAt).toBeNull();
    expect(appData.modes[0].updatedAt).toBe(appData.modes[0].createdAt);
  });

  it('throws an app data store error for malformed JSON', async () => {
    await writeFile(store.filePath, '{', 'utf8');

    await expect(store.read()).rejects.toBeInstanceOf(AppDataStoreError);
    await expect(store.read()).rejects.toThrow('App data file contains invalid JSON.');
  });

  it('throws an app data store error for unsupported schema versions', async () => {
    await writeFile(
      store.filePath,
      JSON.stringify({
        schemaVersion: 999,
        modes: []
      }),
      'utf8'
    );

    await expect(store.read()).rejects.toBeInstanceOf(AppDataStoreError);
    await expect(store.read()).rejects.toThrow('Unsupported app data schema version');
  });

  it('throws an app data store error for invalid mode data', async () => {
    await writeFile(
      store.filePath,
      JSON.stringify({
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: [
          {
            id: 'mode-1',
            name: '',
            createdAt: '2026-04-20T12:00:00.000Z',
            updatedAt: '2026-04-20T12:00:00.000Z'
          }
        ]
      }),
      'utf8'
    );

    await expect(store.read()).rejects.toBeInstanceOf(AppDataStoreError);
    await expect(store.read()).rejects.toThrow('modes[0].name must be a non-empty string.');
  });
});
