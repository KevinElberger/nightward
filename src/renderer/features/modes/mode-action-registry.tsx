import type { ReactNode } from 'react';
import { AppWindow, Link2, type LucideIcon } from 'lucide-react';
import type {
  ModeAction,
  ModeActionInput,
  ModeActionPhase,
  ModeActionSet,
  OpenAppModeAction,
  OpenUrlModeAction
} from '@shared/modes';
import { getOpenUrlDisplayName, normalizeOpenUrl } from '@shared/open-url';
import { ModeOpenAppActionDialogContent } from './components/mode-open-app-action-dialog-content';
import { ModeOpenUrlActionDialogContent } from './components/mode-open-url-action-dialog-content';

export type ModeActionType = ModeAction['type'];

type ModeActionDialogContentRenderOptions = {
  action: ModeAction | null;
  actionId?: string;
  actions: ModeActionSet;
  modeId: string;
  onBack?: () => void;
  onClose: () => void;
  phase: ModeActionPhase;
};

export type ModeActionTypeDefinition = {
  createDefaultInput: () => ModeActionInput;
  description: string;
  getIconSourcePath: (action: ModeAction) => string | null;
  getSummaryTokens: (action: ModeAction) => string[];
  getTitle: (action: ModeAction) => string;
  Icon: LucideIcon;
  label: string;
  matchesLifecycleAction: (action: ModeAction, candidate: ModeAction) => boolean;
  renderDialogContent: (options: ModeActionDialogContentRenderOptions) => ReactNode;
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
    getIconSourcePath: (action) => (isOpenAppModeAction(action) ? action.appPath : null),
    getSummaryTokens: (action) => {
      const tokens = [getRepeatPolicyLabel(action.repeatPolicy)];

      if (isOpenAppModeAction(action) && action.onlyOpenIfNotRunning) {
        tokens.push('Skips if already running');
      }

      return tokens;
    },
    getTitle: (action) => (isOpenAppModeAction(action) ? action.appName : ''),
    Icon: AppWindow,
    label: 'Open App',
    matchesLifecycleAction: (action, candidate) =>
      isOpenAppModeAction(action) && isMatchingOpenAppAction(action, candidate),
    renderDialogContent: ({ action, actionId, actions, modeId, onBack, onClose, phase }) => (
      <ModeOpenAppActionDialogContent
        action={isOpenAppModeAction(action) ? action : null}
        actionId={actionId}
        actions={actions}
        modeId={modeId}
        onBack={onBack}
        onClose={onClose}
        phase={phase}
        title="Open App"
      />
    ),
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
    getIconSourcePath: () => null,
    getSummaryTokens: (action) => {
      const tokens = [getRepeatPolicyLabel(action.repeatPolicy)];

      if (isOpenUrlModeAction(action) && action.label?.trim()) {
        tokens.push(getOpenUrlDisplayName(action.url));
      }

      return tokens;
    },
    getTitle: (action) =>
      isOpenUrlModeAction(action) ? action.label?.trim() || getOpenUrlDisplayName(action.url) : '',
    Icon: Link2,
    label: 'Open URL',
    matchesLifecycleAction: (action, candidate) =>
      isOpenUrlModeAction(action) && isMatchingOpenUrlAction(action, candidate),
    renderDialogContent: ({ action, actionId, modeId, onBack, onClose, phase }) => (
      <ModeOpenUrlActionDialogContent
        action={isOpenUrlModeAction(action) ? action : null}
        actionId={actionId}
        modeId={modeId}
        onBack={onBack}
        onClose={onClose}
        phase={phase}
        title="Open URL"
      />
    ),
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

function isOpenAppModeAction(action: ModeAction | null): action is OpenAppModeAction {
  return action?.type === 'open-app';
}

function isOpenUrlModeAction(action: ModeAction | null): action is OpenUrlModeAction {
  return action?.type === 'open-url';
}

function isMatchingOpenAppAction(action: OpenAppModeAction, candidate: ModeAction) {
  if (!isOpenAppModeAction(candidate)) {
    return false;
  }

  const actionBundleId = normalizeComparableValue(action.bundleId ?? '');
  const candidateBundleId = normalizeComparableValue(candidate.bundleId ?? '');

  if (actionBundleId !== '' && candidateBundleId !== '') {
    return actionBundleId === candidateBundleId;
  }

  return normalizeComparableValue(action.appPath) === normalizeComparableValue(candidate.appPath);
}

function isMatchingOpenUrlAction(action: OpenUrlModeAction, candidate: ModeAction) {
  if (!isOpenUrlModeAction(candidate)) {
    return false;
  }

  return normalizeComparableUrl(action.url) === normalizeComparableUrl(candidate.url);
}

function normalizeComparableValue(value: string) {
  return value.trim().toLowerCase();
}

function normalizeComparableUrl(value: string) {
  return (normalizeOpenUrl(value) ?? value).trim().toLowerCase();
}
