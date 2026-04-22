import type { ReactNode } from 'react';
import { useModesState } from './hooks/use-modes';
import { ModesContext } from './modes-context';

export function ModesProvider({ children }: { children: ReactNode }) {
  const modes = useModesState();

  return <ModesContext.Provider value={modes}>{children}</ModesContext.Provider>;
}
