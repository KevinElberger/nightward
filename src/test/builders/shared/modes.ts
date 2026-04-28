import {
  type ModeActionSet,
  type OpenAppModeActionInput,
  type ModeState,
  type OpenAppModeAction,
  type OpenUrlModeAction,
  type OpenUrlModeActionInput,
  type SavedMode
} from '../../../shared/modes';

type ModeActionSetOverrides = Partial<ModeActionSet>;

type SavedModeOverrides = Omit<Partial<SavedMode>, 'actions'> & {
  actions?: ModeActionSetOverrides;
};

type ModeStateOverrides = Partial<ModeState>;

export const buildOpenAppModeAction = (
  overrides: Partial<OpenAppModeAction> = {}
): OpenAppModeAction => ({
  appName: 'Calendar',
  appPath: '/Applications/Calendar.app',
  bundleId: 'com.apple.iCal',
  enabled: true,
  id: 'action-1',
  onlyOpenIfNotRunning: false,
  repeatPolicy: 'every-activation',
  type: 'open-app',
  ...overrides
});

export const buildOpenAppModeActionInput = (
  overrides: Partial<OpenAppModeActionInput> = {}
): OpenAppModeActionInput => {
  const action = buildOpenAppModeAction(overrides as Partial<OpenAppModeAction>);

  return {
    appName: action.appName,
    appPath: action.appPath,
    ...(action.bundleId === undefined ? {} : { bundleId: action.bundleId }),
    enabled: action.enabled,
    onlyOpenIfNotRunning: action.onlyOpenIfNotRunning,
    repeatPolicy: action.repeatPolicy,
    type: action.type
  };
};

export const buildOpenUrlModeAction = (
  overrides: Partial<OpenUrlModeAction> = {}
): OpenUrlModeAction => ({
  enabled: true,
  id: 'action-1',
  label: 'Focus Playlist',
  repeatPolicy: 'every-activation',
  type: 'open-url',
  url: 'https://open.spotify.com/playlist/focus',
  ...overrides
});

export const buildOpenUrlModeActionInput = (
  overrides: Partial<OpenUrlModeActionInput> = {}
): OpenUrlModeActionInput => {
  const action = buildOpenUrlModeAction(overrides as Partial<OpenUrlModeAction>);

  return {
    enabled: action.enabled,
    ...(action.label === undefined ? {} : { label: action.label }),
    repeatPolicy: action.repeatPolicy,
    type: action.type,
    url: action.url
  };
};

export const buildModeActionSet = (overrides: ModeActionSetOverrides = {}): ModeActionSet => ({
  enter: overrides.enter ? [...overrides.enter] : [],
  exit: overrides.exit ? [...overrides.exit] : []
});

export const buildSavedMode = (overrides: SavedModeOverrides = {}): SavedMode => {
  const { actions, ...rest } = overrides;

  return {
    actions: buildModeActionSet(actions),
    createdAt: '2026-04-20T12:00:00.000Z',
    id: 'mode-1',
    name: 'Focus',
    pinnedAt: null,
    updatedAt: '2026-04-20T12:00:00.000Z',
    ...rest
  };
};

export const buildModeState = (overrides: ModeStateOverrides = {}): ModeState => ({
  activeModeId: null,
  modes: [],
  ...overrides
});
