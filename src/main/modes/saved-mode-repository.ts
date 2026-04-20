import type { SavedMode } from './types';

export type SavedModeRepository = {
  listSavedModes(): SavedMode[];
};
