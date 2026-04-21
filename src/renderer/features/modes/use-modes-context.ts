import { useContext } from 'react';
import { ModesContext } from './modes-context';

export function useModes() {
  const modes = useContext(ModesContext);

  if (modes === null) {
    throw new Error('useModes must be used within ModesProvider.');
  }

  return modes;
}
