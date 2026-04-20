import type { App } from 'electron';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  APP_DATA_FILE_NAME,
  CURRENT_APP_DATA_SCHEMA_VERSION,
  createDefaultAppData,
  type AppData,
  type PersistedMode
} from './types';
import { getRequiredString, isRecord, type JsonRecord } from '../validation/json-record';

type AppDataStoreOptions = {
  userDataPath: string;
  fileName?: string;
};

export class AppDataStoreError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AppDataStoreError';
  }
}

export class AppDataStore {
  private readonly dataFilePath: string;

  constructor({ userDataPath, fileName = APP_DATA_FILE_NAME }: AppDataStoreOptions) {
    this.dataFilePath = path.join(userDataPath, fileName);
  }

  get filePath() {
    return this.dataFilePath;
  }

  async read() {
    try {
      const fileContents = await readFile(this.dataFilePath, 'utf8');
      return parseAppData(fileContents);
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        return createDefaultAppData();
      }

      throw error;
    }
  }

  async write(data: AppData) {
    const validatedData = validateAppData(data);
    const temporaryFilePath = this.getTemporaryFilePath();

    try {
      await mkdir(path.dirname(this.dataFilePath), { recursive: true });
      await writeFile(temporaryFilePath, `${JSON.stringify(validatedData, null, 2)}\n`, 'utf8');
      await rename(temporaryFilePath, this.dataFilePath);
    } catch (error) {
      await rm(temporaryFilePath, { force: true }).catch(() => undefined);
      throw error;
    }
  }

  async update(updater: (data: AppData) => AppData | Promise<AppData>) {
    const currentData = await this.read();
    const nextData = await updater(currentData);

    await this.write(nextData);

    return nextData;
  }

  private getTemporaryFilePath() {
    return `${this.dataFilePath}.${process.pid}.${Date.now()}.tmp`;
  }
}

export const createAppDataStore = (app: Pick<App, 'getPath'>) =>
  new AppDataStore({ userDataPath: app.getPath('userData') });

const parseAppData = (fileContents: string) => {
  try {
    return validateAppData(JSON.parse(fileContents) as unknown);
  } catch (error) {
    if (error instanceof AppDataStoreError) {
      throw error;
    }

    throw new AppDataStoreError('App data file contains invalid JSON.', { cause: error });
  }
};

const validateAppData = (value: unknown): AppData => {
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

  return {
    id: getRequiredAppDataString(value, 'id', modePath),
    name: getRequiredAppDataString(value, 'name', modePath),
    createdAt: getRequiredTimestamp(value, 'createdAt', modePath),
    updatedAt: getRequiredTimestamp(value, 'updatedAt', modePath)
  };
};

const getRequiredAppDataString = (
  record: JsonRecord,
  property: keyof PersistedMode,
  recordPath: string
) =>
  getRequiredString({
    createError: (message) => new AppDataStoreError(message),
    label: recordPath,
    record,
    property
  });

const getRequiredTimestamp = (
  record: JsonRecord,
  property: keyof Pick<PersistedMode, 'createdAt' | 'updatedAt'>,
  recordPath: string
) => {
  const value = getRequiredAppDataString(record, property, recordPath);

  if (Number.isNaN(Date.parse(value))) {
    throw new AppDataStoreError(`${recordPath}.${property} must be a valid timestamp.`);
  }

  return value;
};

const isNodeError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error;
