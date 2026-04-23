import { randomUUID } from 'node:crypto';
import { createEmptyModeActionSet, MODE_NAME_MAX_LENGTH } from '@shared/modes';
import type { AppDataStore } from '../persistence/app-data-store';
import { createDefaultAppData, type AppData, type PersistedMode } from '../persistence/types';
import type { ModeState, SavedMode } from './types';

export const NO_ACTIVE_MODE_LABEL = 'No Active Mode';

export class ModeServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModeServiceError';
  }
}

export class ModeService {
  private appData: AppData = createDefaultAppData();

  constructor(private readonly appDataStore: AppDataStore) {}

  async initialize() {
    this.appData = await this.appDataStore.read();
  }

  getCurrentModeLabel() {
    const activeMode = this.getActiveMode();

    return activeMode?.name ?? NO_ACTIVE_MODE_LABEL;
  }

  getModeState(): ModeState {
    return {
      activeModeId: this.getActiveMode()?.id ?? null,
      modes: this.getSavedModes()
    };
  }

  getSavedModes(limit?: number): SavedMode[] {
    const modes = limit === undefined ? this.appData.modes : this.appData.modes.slice(0, limit);

    return modes.map(toSavedMode);
  }

  async activateSavedMode(modeId: string) {
    const mode = this.appData.modes.find((savedMode) => savedMode.id === modeId);

    if (mode === undefined) {
      return false;
    }

    await this.persistAppData({
      ...this.appData,
      activeModeId: mode.id
    });

    return true;
  }

  async deactivateActiveMode() {
    if (this.appData.activeModeId === null) {
      return false;
    }

    await this.persistAppData({
      ...this.appData,
      activeModeId: null
    });

    return true;
  }

  async createMode(name: string) {
    const now = new Date().toISOString();
    const mode: PersistedMode = {
      actions: createEmptyModeActionSet(),
      id: randomUUID(),
      name: normalizeModeName(name),
      createdAt: now,
      pinnedAt: null,
      updatedAt: now
    };

    await this.persistAppData({
      ...this.appData,
      modes: [...this.appData.modes, mode]
    });

    return toSavedMode(mode);
  }

  async renameMode(modeId: string, name: string) {
    const mode = this.appData.modes.find((savedMode) => savedMode.id === modeId);

    if (mode === undefined) {
      return null;
    }

    const renamedMode: PersistedMode = {
      ...mode,
      name: normalizeModeName(name),
      updatedAt: new Date().toISOString()
    };

    await this.persistAppData({
      ...this.appData,
      modes: this.appData.modes.map((savedMode) =>
        savedMode.id === modeId ? renamedMode : savedMode
      )
    });

    return toSavedMode(renamedMode);
  }

  async setModePinned(modeId: string, isPinned: boolean) {
    const mode = this.appData.modes.find((savedMode) => savedMode.id === modeId);

    if (mode === undefined) {
      return null;
    }

    const now = new Date().toISOString();
    const pinnedMode: PersistedMode = {
      ...mode,
      pinnedAt: isPinned ? (mode.pinnedAt ?? now) : null,
      updatedAt: now
    };

    await this.persistAppData({
      ...this.appData,
      modes: this.appData.modes.map((savedMode) =>
        savedMode.id === modeId ? pinnedMode : savedMode
      )
    });

    return toSavedMode(pinnedMode);
  }

  async deleteMode(modeId: string) {
    if (!this.appData.modes.some((mode) => mode.id === modeId)) {
      return false;
    }

    const activeModeId = this.appData.activeModeId === modeId ? null : this.appData.activeModeId;

    await this.persistAppData({
      ...this.appData,
      activeModeId,
      modes: this.appData.modes.filter((mode) => mode.id !== modeId)
    });

    return true;
  }

  private async persistAppData(data: AppData) {
    await this.appDataStore.write(data);
    this.appData = data;
  }

  private getActiveMode() {
    return this.appData.modes.find((mode) => mode.id === this.appData.activeModeId) ?? null;
  }
}

const normalizeModeName = (name: string) => {
  const normalizedName = name.trim();

  if (normalizedName === '') {
    throw new ModeServiceError('Mode name must be a non-empty string.');
  }

  if (normalizedName.length > MODE_NAME_MAX_LENGTH) {
    throw new ModeServiceError(`Mode name must be ${MODE_NAME_MAX_LENGTH} characters or less.`);
  }

  return normalizedName;
};

const toSavedMode = ({
  actions,
  createdAt,
  id,
  name,
  pinnedAt,
  updatedAt
}: PersistedMode): SavedMode => ({
  actions: {
    enter: [...actions.enter],
    exit: [...actions.exit]
  },
  createdAt,
  id,
  name,
  pinnedAt,
  updatedAt
});
