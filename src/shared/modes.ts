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
