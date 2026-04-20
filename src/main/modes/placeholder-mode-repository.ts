import type { SavedModeRepository } from './saved-mode-repository';
import type { SavedMode } from './types';

export class PlaceholderModeRepository implements SavedModeRepository {
  listSavedModes(): SavedMode[] {
    return [];
  }
}
