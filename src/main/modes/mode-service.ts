import type { SavedModeRepository } from './saved-mode-repository';

export const NO_ACTIVE_MODE_LABEL = 'No Active Mode';

export class ModeService {
  private currentModeName = NO_ACTIVE_MODE_LABEL;

  constructor(private readonly savedModeRepository: SavedModeRepository) {}

  getCurrentModeLabel() {
    return this.currentModeName;
  }

  getSavedModes(limit: number) {
    return this.savedModeRepository.listSavedModes().slice(0, limit);
  }

  activateSavedMode(modeId: string) {
    const mode = this.savedModeRepository
      .listSavedModes()
      .find((savedMode) => savedMode.id === modeId);

    if (mode === undefined) {
      return;
    }

    this.currentModeName = mode.name;
  }
}
