import { createContext, useContext } from 'react';
import type { ModeAction, ModeActionPhase, ModeActionSet } from '@shared/modes';
import { type ModeActionType } from '../mode-action-registry';

export type ModeActionDialogState =
  | { kind: 'closed' }
  | { kind: 'pick-type'; phase: ModeActionPhase }
  | { actionType: ModeActionType; kind: 'create'; phase: ModeActionPhase }
  | { actionId: string; kind: 'edit'; phase: ModeActionPhase };

export type VisibleModeActionDialogState = Exclude<ModeActionDialogState, { kind: 'closed' }>;

export type ModeActionDialogContextValue = {
  action: ModeAction | null;
  actions: ModeActionSet;
  closeDialog: () => void;
  editAction: (phase: ModeActionPhase, actionId: string) => void;
  modeId: string;
  openActionTypePicker: (phase: ModeActionPhase) => void;
  selectActionType: (phase: ModeActionPhase, actionType: ModeActionType) => void;
  showTypePicker: (phase: ModeActionPhase) => void;
  state: VisibleModeActionDialogState | null;
};

export const ModeActionDialogContext = createContext<ModeActionDialogContextValue | null>(null);

export function useModeActionDialog() {
  const context = useContext(ModeActionDialogContext);

  if (context === null) {
    throw new Error('useModeActionDialog must be used within ModeActionDialogProvider.');
  }

  return context;
}
