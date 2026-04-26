export const MODE_NAME_MAX_LENGTH = 70;

export type ModeActionPhase = 'enter' | 'exit';

export type ModeActionRepeatPolicy = 'every-activation' | 'once-per-day';

export type OpenAppModeAction = {
  appName: string;
  appPath: string;
  // Optional macOS bundle identifier, like `com.apple.Safari`.
  bundleId?: string;
  enabled: boolean;
  id: string;
  onlyOpenIfNotRunning: boolean;
  repeatPolicy: ModeActionRepeatPolicy;
  type: 'open-app';
};

export type ModeAction = OpenAppModeAction;

export type OpenAppModeActionInput = Omit<OpenAppModeAction, 'id'>;

export type ModeActionInput = OpenAppModeActionInput;

export type ModeActionSet = {
  enter: ModeAction[];
  exit: ModeAction[];
};

export type SavedMode = {
  actions: ModeActionSet;
  createdAt: string;
  id: string;
  name: string;
  pinnedAt: string | null;
  updatedAt: string;
};

export type ModeState = {
  activeModeId: string | null;
  modes: SavedMode[];
};

export const createEmptyModeActionSet = (): ModeActionSet => ({
  enter: [],
  exit: []
});
