import type { ReactNode } from 'react';
import type { ModeAction, ModeActionPhase, ModeActionSet } from '@shared/modes';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  useModeActionDialog,
  type VisibleModeActionDialogState
} from './mode-action-dialog-context';
import { type ModeActionType } from '../mode-action-registry';
import { ModeActionTypePickerDialogContent } from './mode-action-type-picker-dialog-content';
import { ModeOpenAppActionDialogContent } from './mode-open-app-action-dialog-content';
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
        className="h-[calc(100vh-2.5rem)] max-h-[calc(100vh-2.5rem)] gap-0 overflow-hidden rounded-[8px] border-surface-border-strong bg-card p-0 shadow-[0_36px_110px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.04)] sm:h-[38rem] sm:max-w-[52rem]"
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
      if (state.actionType !== 'open-app') {
        return <UnsupportedModeActionDialogContent onClose={closeDialog} />;
      }

      return (
        <ModeOpenAppActionDialogContent
          action={null}
          actions={actions}
          modeId={modeId}
          onBack={() => {
            showTypePicker(state.phase);
          }}
          onClose={closeDialog}
          phase={state.phase}
        />
      );

    case 'edit':
      if (action?.type !== 'open-app') {
        return <UnsupportedModeActionDialogContent onClose={closeDialog} />;
      }

      return (
        <ModeOpenAppActionDialogContent
          action={action}
          actionId={state.actionId}
          actions={actions}
          modeId={modeId}
          onClose={closeDialog}
          phase={state.phase}
        />
      );

    default:
      return <UnsupportedModeActionDialogContent onClose={closeDialog} />;
  }
}
