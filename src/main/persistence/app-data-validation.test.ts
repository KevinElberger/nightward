import { describe, expect, it } from 'vitest';
import { buildOpenAppModeAction } from '@test/builders/shared/modes';
import { buildAppData, buildPersistedMode } from '@test/builders/main/persistence';
import { AppDataStoreError } from './app-data-store-error';
import { parseAppData, validateAppData } from './app-data-validation';
import { CURRENT_APP_DATA_SCHEMA_VERSION, type AppData } from './types';

const createAppData = (): AppData => buildAppData();

describe('app-data-validation', () => {
  it('parses valid app data', () => {
    const appData = createAppData();

    expect(parseAppData(JSON.stringify(appData))).toEqual(appData);
  });

  it('rethrows validation errors from parseAppData without masking them as JSON errors', () => {
    expect(() =>
      parseAppData(
        JSON.stringify({
          schemaVersion: 999,
          modes: []
        })
      )
    ).toThrow('Unsupported app data schema version: 999.');
  });

  it('wraps malformed JSON as an app data store error', () => {
    expect(() => parseAppData('{')).toThrow(AppDataStoreError);
    expect(() => parseAppData('{')).toThrow('App data file contains invalid JSON.');
  });

  it('rejects non-object app data', () => {
    expect(() => validateAppData(null)).toThrow('App data must be a JSON object.');
  });

  it('rejects non-array modes collections', () => {
    expect(() =>
      validateAppData({
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: 'nope'
      })
    ).toThrow('App data modes must be an array.');
  });

  it('defaults missing activeModeId to null', () => {
    const appData = validateAppData({
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: [buildPersistedMode()]
    });

    expect(appData.activeModeId).toBeNull();
  });

  it('rejects invalid activeModeId values', () => {
    expect(() =>
      validateAppData({
        activeModeId: '',
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: []
      })
    ).toThrow('App data active mode ID must be a non-empty string or null.');
  });

  it('hydrates missing mode timestamps', () => {
    const appData = validateAppData({
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: [
        {
          id: 'mode-1',
          name: 'Focus'
        }
      ]
    });

    expect(appData.modes[0]).toMatchObject({
      id: 'mode-1',
      name: 'Focus',
      actions: {
        enter: [],
        exit: []
      },
      pinnedAt: null
    });
    expect(Date.parse(appData.modes[0].createdAt)).not.toBeNaN();
    expect(appData.modes[0].updatedAt).toBe(appData.modes[0].createdAt);
  });

  it('uses updatedAt as a fallback createdAt timestamp', () => {
    const appData = validateAppData({
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: [
        {
          id: 'mode-1',
          name: 'Focus',
          updatedAt: '2026-04-20T12:00:00.000Z'
        }
      ]
    });

    expect(appData.modes[0].createdAt).toBe('2026-04-20T12:00:00.000Z');
    expect(appData.modes[0].updatedAt).toBe('2026-04-20T12:00:00.000Z');
  });

  it('rejects non-object persisted modes', () => {
    expect(() =>
      validateAppData({
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: ['nope']
      })
    ).toThrow('modes[0] must be a JSON object.');
  });

  it('rejects invalid timestamps', () => {
    expect(() =>
      validateAppData({
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: [
          {
            ...buildPersistedMode(),
            pinnedAt: 'not-a-date'
          }
        ]
      })
    ).toThrow('modes[0].pinnedAt must be a valid timestamp.');
  });

  it('accepts valid persisted open-app actions', () => {
    const appData = validateAppData({
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: [
        buildPersistedMode({
          actions: {
            enter: [buildOpenAppModeAction()],
            exit: []
          }
        })
      ]
    });

    expect(appData.modes[0].actions.enter).toEqual([buildOpenAppModeAction()]);
  });

  it('hydrates missing actions to empty action lists', () => {
    const appData = validateAppData({
      schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
      modes: [
        {
          createdAt: '2026-04-20T12:00:00.000Z',
          id: 'mode-1',
          name: 'Focus',
          pinnedAt: null,
          updatedAt: '2026-04-20T12:00:00.000Z'
        }
      ]
    });

    expect(appData.modes[0].actions).toEqual({
      enter: [],
      exit: []
    });
  });

  it('rejects invalid action collections', () => {
    expect(() =>
      validateAppData({
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: [
          {
            ...buildPersistedMode(),
            actions: 'nope'
          }
        ]
      })
    ).toThrow('modes[0].actions must be a JSON object.');
  });

  it('rejects unsupported action types', () => {
    expect(() =>
      validateAppData({
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: [
          {
            ...buildPersistedMode(),
            actions: {
              enter: [
                {
                  ...buildOpenAppModeAction(),
                  type: 'launch-missiles'
                }
              ],
              exit: []
            }
          }
        ]
      })
    ).toThrow('modes[0].actions.enter[0].type must be a supported action type.');
  });

  it('rejects unsupported action repeat policies', () => {
    expect(() =>
      validateAppData({
        schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
        modes: [
          {
            ...buildPersistedMode(),
            actions: {
              enter: [
                {
                  ...buildOpenAppModeAction(),
                  repeatPolicy: 'sometimes'
                }
              ],
              exit: []
            }
          }
        ]
      })
    ).toThrow('modes[0].actions.enter[0].repeatPolicy must be a supported repeat policy.');
  });
});
