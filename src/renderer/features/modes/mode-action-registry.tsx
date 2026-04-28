import { AppWindow, Link2, type LucideIcon } from 'lucide-react';
import type { ModeAction, ModeActionInput, ModeActionPhase } from '@shared/modes';
import { getOpenUrlDisplayName } from '@shared/open-url';

export type ModeActionType = ModeAction['type'];

export type ModeActionTypeDefinition = {
  createDefaultInput: () => ModeActionInput;
  description: string;
  getSummaryTokens: (action: ModeAction) => string[];
  getTitle: (action: ModeAction) => string;
  Icon: LucideIcon;
  label: string;
  type: ModeActionType;
};

const modeActionTypeDefinitions = {
  'open-app': {
    createDefaultInput: () => ({
      appName: '',
      appPath: '',
      enabled: true,
      onlyOpenIfNotRunning: false,
      repeatPolicy: 'every-activation',
      type: 'open-app'
    }),
    description: 'Launch a macOS app.',
    getSummaryTokens: (action) => {
      const tokens = [getRepeatPolicyLabel(action.repeatPolicy)];

      if (action.type === 'open-app' && action.onlyOpenIfNotRunning) {
        tokens.push('Skips if already running');
      }

      return tokens;
    },
    getTitle: (action) => (action.type === 'open-app' ? action.appName : ''),
    Icon: AppWindow,
    label: 'Open App',
    type: 'open-app'
  },
  'open-url': {
    createDefaultInput: () => ({
      enabled: true,
      repeatPolicy: 'every-activation',
      type: 'open-url',
      url: ''
    }),
    description: 'Open a web link.',
    getSummaryTokens: (action) => {
      const tokens = [getRepeatPolicyLabel(action.repeatPolicy)];

      if (action.type === 'open-url' && action.label?.trim()) {
        tokens.push(getOpenUrlDisplayName(action.url));
      }

      return tokens;
    },
    getTitle: (action) =>
      action.type === 'open-url' ? action.label?.trim() || getOpenUrlDisplayName(action.url) : '',
    Icon: Link2,
    label: 'Open URL',
    type: 'open-url'
  }
} satisfies Record<ModeActionType, ModeActionTypeDefinition>;

export const availableModeActionTypes = Object.values(modeActionTypeDefinitions);

export const getModeActionTypeDefinition = (type: ModeActionType) =>
  modeActionTypeDefinitions[type];

export const getModeActionPhaseLabel = (phase: ModeActionPhase) =>
  phase === 'enter' ? 'When Mode Starts' : 'When Mode Ends';

function getRepeatPolicyLabel(repeatPolicy: ModeAction['repeatPolicy']) {
  return repeatPolicy === 'once-per-day' ? 'Once per day' : 'Every activation';
}
