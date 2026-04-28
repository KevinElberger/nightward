import type { ModeActionPhase, OpenUrlModeAction, OpenUrlModeActionInput } from '@shared/modes';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getModeActionTypeDefinition } from '../mode-action-registry';
import { useModeActionMutations } from '../hooks/use-mode-action-mutations';
import { ModeOpenUrlActionEditor } from './mode-open-url-action-editor';

type ModeOpenUrlActionDialogContentProps = {
  action: OpenUrlModeAction | null;
  actionId?: string;
  modeId: string;
  onBack?: () => void;
  onClose: () => void;
  phase: ModeActionPhase;
};

export function ModeOpenUrlActionDialogContent({
  action,
  actionId,
  modeId,
  onBack,
  onClose,
  phase
}: ModeOpenUrlActionDialogContentProps) {
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

  const handleSaveAction = async (nextAction: OpenUrlModeActionInput) => {
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
        <DialogTitle>{getModeActionTypeDefinition('open-url').label}</DialogTitle>
        <DialogDescription>Configure what should happen when this action runs.</DialogDescription>
      </DialogHeader>
      <ModeOpenUrlActionEditor
        key={actionId ?? `${phase}-open-url`}
        action={action}
        isDeletingAction={isDeletingAction}
        isSavingAction={isSavingAction}
        onBack={onBack}
        onClose={onClose}
        onDeleteAction={actionId === undefined ? undefined : handleDeleteAction}
        onSaveAction={handleSaveAction}
        phase={phase}
      />
    </>
  );
}
