import {
  type ModeActionSet,
  type ModeState,
  type OpenAppModeAction,
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
