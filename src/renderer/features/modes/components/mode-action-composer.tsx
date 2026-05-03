import type { ReactNode } from 'react';
import type { ModeAction, ModeActionPhase, ModeActionSet } from '@shared/modes';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  useModeActionDialog,
  type VisibleModeActionDialogState
} from './mode-action-dialog-context';
import { getModeActionTypeDefinition, type ModeActionType } from '../mode-action-registry';
import { ModeActionTypePickerDialogContent } from './mode-action-type-picker-dialog-content';
import { UnsupportedModeActionDialogContent } from './unsupported-mode-action-dialog-content';

export function ModeActionComposer() {
  const { action, actions, closeDialog, modeId, selectActionType, showTypePicker, state } =
    useModeActionDialog();

  if (state === null) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(isOpen) => (!isOpen ? closeDialog() : undefined)}>
      <DialogContent
        showCloseButton={false}
        className="h-[calc(100vh-2.5rem)] max-h-[calc(100vh-2.5rem)] gap-0 overflow-hidden rounded-[8px] border-surface-border-strong bg-card p-0 shadow-[0_36px_120px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.055)] sm:h-[39rem] sm:max-w-[54rem]"
      >
        {renderModeActionDialogContent({
          action,
          actions,
          closeDialog,
          modeId,
          selectActionType,
          showTypePicker,
          state
        })}
      </DialogContent>
    </Dialog>
  );
}

type RenderModeActionDialogContentOptions = {
  action: ModeAction | null;
  actions: ModeActionSet;
  closeDialog: () => void;
  modeId: string;
  selectActionType: (phase: ModeActionPhase, actionType: ModeActionType) => void;
  showTypePicker: (phase: ModeActionPhase) => void;
  state: VisibleModeActionDialogState;
};

function renderModeActionDialogContent({
  action,
  actions,
  closeDialog,
  modeId,
  selectActionType,
  showTypePicker,
  state
}: RenderModeActionDialogContentOptions): ReactNode {
  switch (state.kind) {
    case 'pick-type':
      return (
        <ModeActionTypePickerDialogContent
          onClose={closeDialog}
          onSelectActionType={selectActionType}
          phase={state.phase}
        />
      );

    case 'create':
      return getModeActionTypeDefinition(state.actionType).renderDialogContent({
        action: null,
        actions,
        modeId,
        onBack: () => {
          showTypePicker(state.phase);
        },
        onClose: closeDialog,
        phase: state.phase
      });

    case 'edit':
      if (action === null) {
        return <UnsupportedModeActionDialogContent onClose={closeDialog} />;
      }

      return getModeActionTypeDefinition(action.type).renderDialogContent({
        action,
        actionId: state.actionId,
        actions,
        modeId,
        onClose: closeDialog,
        phase: state.phase
      });

    default:
      return <UnsupportedModeActionDialogContent onClose={closeDialog} />;
  }
}
