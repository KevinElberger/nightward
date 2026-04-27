import type { ModeActionSet } from '@shared/modes';

export const APP_DATA_FILE_NAME = 'nightward-data.json';
export const CURRENT_APP_DATA_SCHEMA_VERSION = 1;

export type PersistedMode = {
  actions: ModeActionSet;
  id: string;
  name: string;
  createdAt: string;
  pinnedAt: string | null;
  updatedAt: string;
};

export type AppData = {
  schemaVersion: typeof CURRENT_APP_DATA_SCHEMA_VERSION;
  modes: PersistedMode[];
};

export const createDefaultAppData = (): AppData => ({
  schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
  modes: []
});
