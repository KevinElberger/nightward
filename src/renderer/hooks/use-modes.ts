import { useCallback, useEffect, useState } from 'react';
import type { SavedMode } from '../../shared/modes';

type ModesState = {
  activateMode: (id: string) => Promise<boolean>;
  createMode: (name: string) => Promise<SavedMode | null>;
  deleteMode: (id: string) => Promise<boolean>;
  error: string | null;
  isLoading: boolean;
  modes: SavedMode[];
  renameMode: (id: string, name: string) => Promise<SavedMode | null>;
  refreshModes: () => Promise<void>;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
  error instanceof Error ? error.message : fallbackMessage;

export const useModes = (): ModesState => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modes, setModes] = useState<SavedMode[]>([]);

  const loadModes = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      setModes(await window.nightward.modes.list());
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load modes.'));
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
        setModes(await window.nightward.modes.list());

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

  const deleteMode = useCallback(
    (id: string) => runModeMutation(() => window.nightward.modes.delete(id), false),
    [runModeMutation]
  );

  const activateMode = useCallback(
    (id: string) => runModeMutation(() => window.nightward.modes.activate(id), false),
    [runModeMutation]
  );

  useEffect(() => {
    const loadInitialModes = async () => {
      await loadModes();
    };

    void loadInitialModes();
  }, [loadModes]);

  return {
    activateMode,
    createMode,
    deleteMode,
    error,
    isLoading,
    modes,
    renameMode,
    refreshModes: loadModes
  };
};
