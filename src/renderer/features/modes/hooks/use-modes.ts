import { useCallback, useEffect, useState } from 'react';
import type { SavedMode } from '../../../../shared/modes';

export type ModesState = {
  activateMode: (id: string) => Promise<boolean>;
  activeModeId: string | null;
  createMode: (name: string) => Promise<SavedMode | null>;
  deactivateMode: () => Promise<boolean>;
  deleteMode: (id: string) => Promise<boolean>;
  error: string | null;
  isLoading: boolean;
  modes: SavedMode[];
  renameMode: (id: string, name: string) => Promise<SavedMode | null>;
  refreshModes: () => Promise<void>;
  setModePinned: (id: string, isPinned: boolean) => Promise<SavedMode | null>;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
  error instanceof Error ? error.message : fallbackMessage;

export const useModesState = (): ModesState => {
  const [activeModeId, setActiveModeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modes, setModes] = useState<SavedMode[]>([]);

  const loadModeState = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const modeState = await window.nightward.modes.getState();

      setActiveModeId(modeState.activeModeId);
      setModes(modeState.modes);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load modes.'));
      setActiveModeId(null);
      setModes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runModeMutation = useCallback(
    async <Result>(mutation: () => Promise<Result>, failureResult: Result) => {
      setError(null);
      setIsLoading(true);

      try {
        const result = await mutation();
        const modeState = await window.nightward.modes.getState();

        setActiveModeId(modeState.activeModeId);
        setModes(modeState.modes);

        return result;
      } catch (mutationError) {
        setError(getErrorMessage(mutationError, 'Unable to update modes.'));

        return failureResult;
      } finally {
        setIsLoading(false);
      }
    },
    []
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
    (id: string) => runModeMutation(() => window.nightward.modes.activate(id), false),
    [runModeMutation]
  );

  const deactivateMode = useCallback(
    () => runModeMutation(() => window.nightward.modes.deactivate(), false),
    [runModeMutation]
  );

  useEffect(() => {
    const loadInitialModes = async () => {
      await loadModeState();
    };

    void loadInitialModes();
  }, [loadModeState]);

  return {
    activateMode,
    activeModeId,
    createMode,
    deactivateMode,
    deleteMode,
    error,
    isLoading,
    modes,
    renameMode,
    refreshModes: loadModeState,
    setModePinned
  };
};
