import { getRequiredString, isRecord, type JsonRecord } from '../validation/json-record';
import { AppDataStoreError } from './app-data-store-error';
import { validateModeActionSet } from './mode-action-validation';
import { CURRENT_APP_DATA_SCHEMA_VERSION, type AppData, type PersistedMode } from './types';

export const parseAppData = (fileContents: string) => {
  try {
    return validateAppData(JSON.parse(fileContents) as unknown);
  } catch (error) {
    if (error instanceof AppDataStoreError) {
      throw error;
    }

    throw new AppDataStoreError('App data file contains invalid JSON.', { cause: error });
  }
};

export const validateAppData = (value: unknown): AppData => {
  if (!isRecord(value)) {
    throw new AppDataStoreError('App data must be a JSON object.');
  }

  if (value.schemaVersion !== CURRENT_APP_DATA_SCHEMA_VERSION) {
    throw new AppDataStoreError(
      `Unsupported app data schema version: ${String(value.schemaVersion)}.`
    );
  }

  if (!Array.isArray(value.modes)) {
    throw new AppDataStoreError('App data modes must be an array.');
  }

  return {
    schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
    modes: value.modes.map(validatePersistedMode)
  };
};

const validatePersistedMode = (value: unknown, index: number): PersistedMode => {
  const modePath = `modes[${index}]`;

  if (!isRecord(value)) {
    throw new AppDataStoreError(`${modePath} must be a JSON object.`);
  }

  const now = new Date().toISOString();
  const createdAt =
    getOptionalTimestamp(value, 'createdAt', modePath) ??
    getOptionalTimestamp(value, 'updatedAt', modePath) ??
    now;
  const updatedAt = getOptionalTimestamp(value, 'updatedAt', modePath) ?? createdAt;

  return {
    actions: validateModeActionSet(value.actions, modePath),
    id: getRequiredAppDataString(value, 'id', modePath),
    name: getRequiredAppDataString(value, 'name', modePath),
    createdAt,
    pinnedAt: getOptionalTimestamp(value, 'pinnedAt', modePath),
    updatedAt
  };
};

const getRequiredAppDataString = (record: JsonRecord, property: string, recordPath: string) =>
  getRequiredString({
    createError: (message) => new AppDataStoreError(message),
    label: recordPath,
    record,
    property
  });

const getOptionalTimestamp = (
  record: JsonRecord,
  property: keyof Pick<PersistedMode, 'createdAt' | 'pinnedAt' | 'updatedAt'>,
  recordPath: string
) => {
  const value = record[property];

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw new AppDataStoreError(`${recordPath}.${property} must be a non-empty string.`);
  }

  if (Number.isNaN(Date.parse(value))) {
    throw new AppDataStoreError(`${recordPath}.${property} must be a valid timestamp.`);
  }

  return value;
};
