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

export type OpenUrlModeAction = {
  enabled: boolean;
  id: string;
  label?: string;
  repeatPolicy: ModeActionRepeatPolicy;
  type: 'open-url';
  url: string;
};

export type ModeAction = OpenAppModeAction | OpenUrlModeAction;

export type OpenAppModeActionInput = Omit<OpenAppModeAction, 'id'>;
export type OpenUrlModeActionInput = Omit<OpenUrlModeAction, 'id'>;

export type ModeActionInput = OpenAppModeActionInput | OpenUrlModeActionInput;

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
