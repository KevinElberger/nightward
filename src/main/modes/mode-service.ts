import { randomUUID } from 'node:crypto';
import {
  createEmptyModeActionSet,
  MODE_NAME_MAX_LENGTH,
  type ModeAction,
  type ModeActionInput,
  type ModeActionPhase
} from '@shared/modes';
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
    return this.updateMode(modeId, (mode) => ({
      ...mode,
      name: normalizeModeName(name),
      updatedAt: new Date().toISOString()
    }));
  }

  async setModePinned(modeId: string, isPinned: boolean) {
    return this.updateMode(modeId, (mode) => {
      const now = new Date().toISOString();

      return {
        ...mode,
        pinnedAt: isPinned ? (mode.pinnedAt ?? now) : null,
        updatedAt: now
      };
    });
  }

  async createModeAction(modeId: string, phase: ModeActionPhase, action: ModeActionInput) {
    return this.updateMode(modeId, (mode) => ({
      ...mode,
      actions: appendModeAction(mode.actions, phase, {
        ...action,
        id: randomUUID()
      }),
      updatedAt: new Date().toISOString()
    }));
  }

  async updateModeAction(
    modeId: string,
    phase: ModeActionPhase,
    actionId: string,
    action: ModeActionInput
  ) {
    return this.updateMode(modeId, (mode) => {
      const nextActions = replaceModeAction(mode.actions, phase, actionId, {
        ...action,
        id: actionId
      });

      if (nextActions === null) {
        return null;
      }

      return {
        ...mode,
        actions: nextActions,
        updatedAt: new Date().toISOString()
      };
    });
  }

  async deleteModeAction(modeId: string, phase: ModeActionPhase, actionId: string) {
    return this.updateMode(modeId, (mode) => {
      const nextActions = removeModeAction(mode.actions, phase, actionId);

      if (nextActions === null) {
        return null;
      }

      return {
        ...mode,
        actions: nextActions,
        updatedAt: new Date().toISOString()
      };
    });
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

  private async updateMode(modeId: string, updater: (mode: PersistedMode) => PersistedMode | null) {
    const currentMode = this.appData.modes.find((savedMode) => savedMode.id === modeId);

    if (currentMode === undefined) {
      return null;
    }

    const updatedMode = updater(currentMode);

    if (updatedMode === null) {
      return null;
    }

    await this.persistAppData({
      ...this.appData,
      modes: this.appData.modes.map((savedMode) =>
        savedMode.id === modeId ? updatedMode : savedMode
      )
    });

    return toSavedMode(updatedMode);
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

const appendModeAction = (
  actions: PersistedMode['actions'],
  phase: ModeActionPhase,
  action: ModeAction
): PersistedMode['actions'] => ({
  ...actions,
  [phase]: [...actions[phase], action]
});

const replaceModeAction = (
  actions: PersistedMode['actions'],
  phase: ModeActionPhase,
  actionId: string,
  nextAction: ModeAction
): PersistedMode['actions'] | null => {
  const currentActions = actions[phase];

  if (!currentActions.some((action) => action.id === actionId)) {
    return null;
  }

  return {
    ...actions,
    [phase]: currentActions.map((action) => (action.id === actionId ? nextAction : action))
  };
};

const removeModeAction = (
  actions: PersistedMode['actions'],
  phase: ModeActionPhase,
  actionId: string
): PersistedMode['actions'] | null => {
  const currentActions = actions[phase];
  const nextActions = currentActions.filter((action) => action.id !== actionId);

  if (nextActions.length === currentActions.length) {
    return null;
  }

  return {
    ...actions,
    [phase]: nextActions
  };
};
