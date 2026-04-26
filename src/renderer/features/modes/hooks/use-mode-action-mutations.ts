import { useCallback, useState } from 'react';
import type { ModeActionInput, ModeActionPhase } from '@shared/modes';
import { useModes } from '../use-modes-context';

type SaveModeActionInput = {
  action: ModeActionInput;
  actionId?: string;
  phase: ModeActionPhase;
};

export function useModeActionMutations(modeId: string) {
  const { createModeAction, deleteModeAction, updateModeAction } = useModes();
  const [isDeletingAction, setIsDeletingAction] = useState(false);
  const [isSavingAction, setIsSavingAction] = useState(false);

  const saveAction = useCallback(
    async ({ action, actionId, phase }: SaveModeActionInput) => {
      if (isSavingAction || isDeletingAction) {
        return false;
      }

      setIsSavingAction(true);

      try {
        const updatedMode =
          actionId === undefined
            ? await createModeAction(modeId, phase, action)
            : await updateModeAction(modeId, phase, actionId, action);

        return updatedMode !== null;
      } finally {
        setIsSavingAction(false);
      }
    },
    [createModeAction, isDeletingAction, isSavingAction, modeId, updateModeAction]
  );

  const deleteAction = useCallback(
    async (phase: ModeActionPhase, actionId: string) => {
      if (isDeletingAction || isSavingAction) {
        return false;
      }

      setIsDeletingAction(true);

      try {
        const updatedMode = await deleteModeAction(modeId, phase, actionId);

        return updatedMode !== null;
      } finally {
        setIsDeletingAction(false);
      }
    },
    [deleteModeAction, isDeletingAction, isSavingAction, modeId]
  );

  return {
    deleteAction,
    isDeletingAction,
    isSavingAction,
    saveAction
  };
}
