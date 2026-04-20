export const APP_DATA_FILE_NAME = 'nightward-data.json';
export const CURRENT_APP_DATA_SCHEMA_VERSION = 1;

export type PersistedMode = {
  id: string;
  name: string;
  createdAt: string;
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
