import { createContext } from 'react';

export type AppSelectionContextValue = {
  selectMode: (modeId: string | null) => void;
  selectedModeId: string | null;
};

export const AppSelectionContext = createContext<AppSelectionContextValue | null>(null);
