import { useContext } from 'react';
import { AppSelectionContext } from './app-selection-context';

export function useAppSelection() {
  const selection = useContext(AppSelectionContext);

  if (selection === null) {
    throw new Error('useAppSelection must be used within AppSelectionProvider.');
  }

  return selection;
}
