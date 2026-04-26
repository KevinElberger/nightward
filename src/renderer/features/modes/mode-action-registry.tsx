import { AppWindow, type LucideIcon } from 'lucide-react';
import type { ModeAction, ModeActionInput, ModeActionPhase } from '@shared/modes';

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
      onlyOpenIfNotRunning: true,
      repeatPolicy: 'every-activation',
      type: 'open-app'
    }),
    description: 'Launch a macOS app.',
    getSummaryTokens: (action) => {
      const tokens = [getRepeatPolicyLabel(action.repeatPolicy)];

      if (action.onlyOpenIfNotRunning) {
        tokens.push('Skips if already open');
      }

      return tokens;
    },
    getTitle: (action) => action.appName,
    Icon: AppWindow,
    label: 'Open App',
    type: 'open-app'
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
