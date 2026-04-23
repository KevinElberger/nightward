import {
  createEmptyModeActionSet,
  type ModeAction,
  type ModeActionRepeatPolicy,
  type ModeActionSet
} from '../../shared/modes';
import { getRequiredString, isRecord, type JsonRecord } from '../validation/json-record';
import { AppDataStoreError } from './app-data-store-error';
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
    activeModeId: validateActiveModeId(value.activeModeId),
    schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
    modes: value.modes.map(validatePersistedMode)
  };
};

const validateActiveModeId = (value: unknown) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw new AppDataStoreError('App data active mode ID must be a non-empty string or null.');
  }

  return value;
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

const validateModeActionSet = (value: unknown, modePath: string): ModeActionSet => {
  if (value === undefined) {
    return createEmptyModeActionSet();
  }

  if (!isRecord(value)) {
    throw new AppDataStoreError(`${modePath}.actions must be a JSON object.`);
  }

  return {
    enter: validateModeActionList(value.enter, `${modePath}.actions.enter`),
    exit: validateModeActionList(value.exit, `${modePath}.actions.exit`)
  };
};

const validateModeActionList = (value: unknown, actionListPath: string): ModeAction[] => {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new AppDataStoreError(`${actionListPath} must be an array.`);
  }

  return value.map((action, index) => validateModeAction(action, `${actionListPath}[${index}]`));
};

const validateModeAction = (value: unknown, actionPath: string): ModeAction => {
  if (!isRecord(value)) {
    throw new AppDataStoreError(`${actionPath} must be a JSON object.`);
  }

  const type = getRequiredAppDataString(value, 'type', actionPath);

  if (type !== 'open-app') {
    throw new AppDataStoreError(`${actionPath}.type must be a supported action type.`);
  }

  const bundleId = getOptionalAppDataString(value, 'bundleId', actionPath);

  return {
    appName: getRequiredAppDataString(value, 'appName', actionPath),
    appPath: getRequiredAppDataString(value, 'appPath', actionPath),
    ...(bundleId === null ? {} : { bundleId }),
    enabled: getRequiredBoolean(value, 'enabled', actionPath),
    id: getRequiredAppDataString(value, 'id', actionPath),
    onlyOpenIfNotRunning: getRequiredBoolean(value, 'onlyOpenIfNotRunning', actionPath),
    repeatPolicy: validateRepeatPolicy(value.repeatPolicy, actionPath),
    type
  };
};

const validateRepeatPolicy = (value: unknown, actionPath: string): ModeActionRepeatPolicy => {
  if (value === 'every-activation' || value === 'once-per-day') {
    return value;
  }

  throw new AppDataStoreError(`${actionPath}.repeatPolicy must be a supported repeat policy.`);
};

const getRequiredAppDataString = (record: JsonRecord, property: string, recordPath: string) =>
  getRequiredString({
    createError: (message) => new AppDataStoreError(message),
    label: recordPath,
    record,
    property
  });

const getOptionalAppDataString = (record: JsonRecord, property: string, recordPath: string) => {
  const value = record[property];

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw new AppDataStoreError(`${recordPath}.${property} must be a non-empty string.`);
  }

  return value;
};

const getRequiredBoolean = (record: JsonRecord, property: string, recordPath: string) => {
  const value = record[property];

  if (typeof value !== 'boolean') {
    throw new AppDataStoreError(`${recordPath}.${property} must be a boolean.`);
  }

  return value;
};

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
