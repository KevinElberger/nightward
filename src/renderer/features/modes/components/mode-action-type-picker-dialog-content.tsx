import type { ModeActionPhase } from '@shared/modes';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type ModeActionType } from '../mode-action-registry';
import { ModeActionTypePicker } from './mode-action-type-picker';

type ModeActionTypePickerDialogContentProps = {
  onClose: () => void;
  onSelectActionType: (phase: ModeActionPhase, actionType: ModeActionType) => void;
  phase: ModeActionPhase;
};

export function ModeActionTypePickerDialogContent({
  onClose,
  onSelectActionType,
  phase
}: ModeActionTypePickerDialogContentProps) {
  return (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>Add action</DialogTitle>
        <DialogDescription>Choose the type of action to create.</DialogDescription>
      </DialogHeader>
      <ModeActionTypePicker
        onClose={onClose}
        phase={phase}
        onSelectActionType={(actionType) => {
          onSelectActionType(phase, actionType);
        }}
      />
    </>
  );
}
