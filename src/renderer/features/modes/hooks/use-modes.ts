import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ModeActionFailure, ModeAutomationResult } from '@shared/mode-automation';
import type { ModeActionInput, ModeActionPhase, ModeState, SavedMode } from '@shared/modes';

type RunModeMutation = <Result>(
  mutation: () => Promise<Result>,
  failureResult: Result
) => Promise<Result>;

export type ModesState = {
  activateMode: (id: string) => Promise<boolean>;
  activeModeId: string | null;
  createModeAction: (
    modeId: string,
    phase: ModeActionPhase,
    action: ModeActionInput
  ) => Promise<SavedMode | null>;
  createMode: (name: string) => Promise<SavedMode | null>;
  deactivateMode: () => Promise<boolean>;
  deleteModeAction: (
    modeId: string,
    phase: ModeActionPhase,
    actionId: string
  ) => Promise<SavedMode | null>;
  deleteMode: (id: string) => Promise<boolean>;
  error: string | null;
  isLoading: boolean;
  modes: SavedMode[];
  renameMode: (id: string, name: string) => Promise<SavedMode | null>;
  refreshModes: () => Promise<void>;
  setModePinned: (id: string, isPinned: boolean) => Promise<SavedMode | null>;
  updateModeAction: (
    modeId: string,
    phase: ModeActionPhase,
    actionId: string,
    action: ModeActionInput
  ) => Promise<SavedMode | null>;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
  error instanceof Error ? error.message : fallbackMessage;

const createFailedModeAutomationResult = (): ModeAutomationResult => ({
  actionFailures: [],
  ok: false
});

const showModeActionFailureToast = (failure: ModeActionFailure) => {
  toast.error(getModeActionFailureToastTitle(failure), {
    description: failure.message
  });
};

const getModeActionFailureToastTitle = (failure: ModeActionFailure) => {
  if (failure.actionType === 'open-app') {
    return `Couldn't open ${failure.appName ?? 'app'}.`;
  }

  return 'Mode action failed.';
};

export const useModesState = (): ModesState => {
  const [activeModeId, setActiveModeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modes, setModes] = useState<SavedMode[]>([]);

  const applyModeState = useCallback((modeState: ModeState) => {
    setActiveModeId(modeState.activeModeId);
    setModes(modeState.modes);
  }, []);

  const loadModeState = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const modeState = await window.nightward.modes.getState();

      applyModeState(modeState);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load modes.'));
      setActiveModeId(null);
      setModes([]);
    } finally {
      setIsLoading(false);
    }
  }, [applyModeState]);

  const runModeMutation: RunModeMutation = useCallback(
    async <Result>(mutation: () => Promise<Result>, failureResult: Result) => {
      setError(null);

      try {
        const result = await mutation();
        const modeState = await window.nightward.modes.getState();

        applyModeState(modeState);

        return result;
      } catch (mutationError) {
        setError(getErrorMessage(mutationError, 'Unable to update modes.'));

        return failureResult;
      }
    },
    [applyModeState]
  );

  const createMode = useCallback(
    (name: string) => runModeMutation(() => window.nightward.modes.create(name), null),
    [runModeMutation]
  );

  const renameMode = useCallback(
    (id: string, name: string) =>
      runModeMutation(() => window.nightward.modes.rename(id, name), null),
    [runModeMutation]
  );

  const setModePinned = useCallback(
    (id: string, isPinned: boolean) =>
      runModeMutation(() => window.nightward.modes.setPinned(id, isPinned), null),
    [runModeMutation]
  );

  const deleteMode = useCallback(
    (id: string) => runModeMutation(() => window.nightward.modes.delete(id), false),
    [runModeMutation]
  );

  const activateMode = useCallback(
    async (id: string) => {
      const result = await runModeMutation(
        () => window.nightward.modes.activate(id),
        createFailedModeAutomationResult()
      );

      result.actionFailures.forEach(showModeActionFailureToast);

      return result.ok;
    },
    [runModeMutation]
  );

  const deactivateMode = useCallback(async () => {
    const result = await runModeMutation(
      () => window.nightward.modes.deactivate(),
      createFailedModeAutomationResult()
    );

    result.actionFailures.forEach(showModeActionFailureToast);

    return result.ok;
  }, [runModeMutation]);

  const createModeAction = useCallback(
    (modeId: string, phase: ModeActionPhase, action: ModeActionInput) =>
      runModeMutation(() => window.nightward.modes.createAction(modeId, phase, action), null),
    [runModeMutation]
  );

  const updateModeAction = useCallback(
    (modeId: string, phase: ModeActionPhase, actionId: string, action: ModeActionInput) =>
      runModeMutation(
        () => window.nightward.modes.updateAction(modeId, phase, actionId, action),
        null
      ),
    [runModeMutation]
  );

  const deleteModeAction = useCallback(
    (modeId: string, phase: ModeActionPhase, actionId: string) =>
      runModeMutation(() => window.nightward.modes.deleteAction(modeId, phase, actionId), null),
    [runModeMutation]
  );

  useEffect(() => {
    const loadInitialModes = async () => {
      await loadModeState();
    };

    void loadInitialModes();
  }, [loadModeState]);

  useEffect(
    () =>
      window.nightward.modes.onChanged((modeState) => {
        setError(null);
        setIsLoading(false);
        applyModeState(modeState);
      }),
    [applyModeState]
  );

  return {
    activateMode,
    activeModeId,
    createModeAction,
    createMode,
    deactivateMode,
    deleteModeAction,
    deleteMode,
    error,
    isLoading,
    modes,
    renameMode,
    refreshModes: loadModeState,
    setModePinned,
    updateModeAction
  };
};
