import type { App } from 'electron';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  APP_DATA_FILE_NAME,
  createDefaultAppData,
  type AppData
} from './types';
import { parseAppData, validateAppData } from './app-data-validation';

type AppDataStoreOptions = {
  userDataPath: string;
  fileName?: string;
};

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

const isNodeError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error;

export { AppDataStoreError } from './app-data-store-error';
