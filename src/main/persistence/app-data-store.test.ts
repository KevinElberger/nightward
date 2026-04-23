import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppDataStore, AppDataStoreError } from './app-data-store';
import { createTestPersistedMode } from './persisted-mode-test-fixture';
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
    const appData: AppData = {
      activeModeId: 'mode-1',
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: [createTestPersistedMode()]
    };

    await store.write(appData);

    await expect(store.read()).resolves.toEqual(appData);
    await expect(readFile(store.filePath, 'utf8')).resolves.toContain('"modes"');
  });

  it('defaults missing active mode IDs to null', async () => {
    await writeFile(
      store.filePath,
      JSON.stringify({
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: [createTestPersistedMode()]
      }),
      'utf8'
    );

    await expect(store.read()).resolves.toEqual({
      activeModeId: null,
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: [createTestPersistedMode()]
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

  it('throws an app data store error for invalid active mode IDs', async () => {
    await writeFile(
      store.filePath,
      JSON.stringify({
        activeModeId: '',
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: []
      }),
      'utf8'
    );

    await expect(store.read()).rejects.toBeInstanceOf(AppDataStoreError);
    await expect(store.read()).rejects.toThrow(
      'App data active mode ID must be a non-empty string or null.'
    );
  });
});
