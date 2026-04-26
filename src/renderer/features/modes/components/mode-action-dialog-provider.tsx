import { useState, type ReactNode } from 'react';
import type { ModeAction, SavedMode } from '@shared/modes';
import {
  ModeActionDialogContext,
  type ModeActionDialogState,
  type VisibleModeActionDialogState
} from './mode-action-dialog-context';

type ModeActionDialogProviderProps = {
  children: ReactNode;
  mode: SavedMode;
};

export function ModeActionDialogProvider({ children, mode }: ModeActionDialogProviderProps) {
  const [dialogState, setDialogState] = useState<ModeActionDialogState>({
    kind: 'closed'
  });
  const editingAction = getEditingAction(dialogState, mode);
  const visibleDialogState = getVisibleDialogState(dialogState, editingAction);

  return (
    <ModeActionDialogContext.Provider
      value={{
        action: editingAction,
        actions: mode.actions,
        closeDialog: () => {
          setDialogState({ kind: 'closed' });
        },
        editAction: (phase, actionId) => {
          setDialogState({ actionId, kind: 'edit', phase });
        },
        modeId: mode.id,
        openActionTypePicker: (phase) => {
          setDialogState({ kind: 'pick-type', phase });
        },
        selectActionType: (phase, actionType) => {
          setDialogState({ actionType, kind: 'create', phase });
        },
        showTypePicker: (phase) => {
          setDialogState({ kind: 'pick-type', phase });
        },
        state: visibleDialogState
      }}
    >
      {children}
    </ModeActionDialogContext.Provider>
  );
}

function getEditingAction(dialogState: ModeActionDialogState, mode: SavedMode): ModeAction | null {
  if (dialogState.kind !== 'edit') {
    return null;
  }

  return (
    mode.actions[dialogState.phase].find((modeAction) => modeAction.id === dialogState.actionId) ??
    null
  );
}

function getVisibleDialogState(
  dialogState: ModeActionDialogState,
  editingAction: ModeAction | null
): VisibleModeActionDialogState | null {
  if (dialogState.kind === 'closed') {
    return null;
  }

  if (dialogState.kind === 'edit' && editingAction === null) {
    return null;
  }

  return dialogState;
}
