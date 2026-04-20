import { useCallback, useEffect, useState } from 'react';
import type { SavedMode } from '../../shared/modes';

type ModesState = {
  error: string | null;
  isLoading: boolean;
  modes: SavedMode[];
  refreshModes: () => Promise<void>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unable to load modes.';

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
      setError(getErrorMessage(loadError));
      setModes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialModes = async () => {
      await loadModes();
    };

    void loadInitialModes();
  }, [loadModes]);

  return {
    error,
    isLoading,
    modes,
    refreshModes: loadModes
  };
};
