import type { ReactNode } from 'react';
import { useState } from 'react';
import { AppSelectionContext } from './app-selection-context';

export function AppSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedModeId, selectMode] = useState<string | null>(null);

  return (
    <AppSelectionContext.Provider value={{ selectMode, selectedModeId }}>
      {children}
    </AppSelectionContext.Provider>
  );
}
