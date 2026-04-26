import type {
  ModeActionPhase,
  ModeActionSet,
  OpenAppModeAction,
  OpenAppModeActionInput
} from '@shared/modes';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getModeActionTypeDefinition } from '../mode-action-registry';
import { useModeActionMutations } from '../hooks/use-mode-action-mutations';
import { ModeOpenAppActionEditor } from './mode-open-app-action-editor';

type ModeOpenAppActionDialogContentProps = {
  action: OpenAppModeAction | null;
  actionId?: string;
  actions: ModeActionSet;
  modeId: string;
  onBack?: () => void;
  onClose: () => void;
  phase: ModeActionPhase;
};

export function ModeOpenAppActionDialogContent({
  action,
  actionId,
  actions,
  modeId,
  onBack,
  onClose,
  phase
}: ModeOpenAppActionDialogContentProps) {
  const { deleteAction, isDeletingAction, isSavingAction, saveAction } =
    useModeActionMutations(modeId);

  const handleDeleteAction = async () => {
    if (actionId === undefined) {
      return;
    }

    const deleted = await deleteAction(phase, actionId);

    if (deleted) {
      onClose();
    }
  };

  const handleSaveAction = async (nextAction: OpenAppModeActionInput) => {
    const saved = await saveAction({
      action: nextAction,
      ...(actionId === undefined ? {} : { actionId }),
      phase
    });

    if (saved) {
      onClose();
    }
  };

  return (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>{getModeActionTypeDefinition('open-app').label}</DialogTitle>
        <DialogDescription>Configure what should happen when this action runs.</DialogDescription>
      </DialogHeader>
      <ModeOpenAppActionEditor
        key={actionId ?? `${phase}-open-app`}
        action={action}
        isDeletingAction={isDeletingAction}
        isSavingAction={isSavingAction}
        modeActions={actions}
        onBack={onBack}
        onClose={onClose}
        onDeleteAction={actionId === undefined ? undefined : handleDeleteAction}
        onSaveAction={handleSaveAction}
        phase={phase}
      />
    </>
  );
}
