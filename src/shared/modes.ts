export const MODE_NAME_MAX_LENGTH = 70;

export type SavedMode = {
  createdAt: string;
  id: string;
  name: string;
  updatedAt: string;
};

export type ModeState = {
  activeModeId: string | null;
  modes: SavedMode[];
};
