import type { AppDataStore } from '../persistence/app-data-store';
import { createDefaultAppData, type AppData } from '../persistence/types';
import type { SavedMode } from './types';

export const NO_ACTIVE_MODE_LABEL = 'No Active Mode';

export class ModeService {
  private appData: AppData = createDefaultAppData();
  private currentModeName = NO_ACTIVE_MODE_LABEL;

  constructor(private readonly appDataStore: AppDataStore) {}

  async initialize() {
    this.appData = await this.appDataStore.read();
  }

  getCurrentModeLabel() {
    return this.currentModeName;
  }

  getSavedModes(limit: number): SavedMode[] {
    return this.appData.modes.slice(0, limit).map(({ id, name }) => ({
      id,
      name
    }));
  }

  activateSavedMode(modeId: string) {
    const mode = this.appData.modes.find((savedMode) => savedMode.id === modeId);

    if (mode === undefined) {
      return;
    }

    this.currentModeName = mode.name;
  }
}
