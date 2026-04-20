export type SavedMode = {
  id: string;
  name: string;
};

export type ModeState = {
  activeModeId: string | null;
  modes: SavedMode[];
};
