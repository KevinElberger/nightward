import { createContext } from 'react';
import type { ModesState } from './hooks/use-modes';

export const ModesContext = createContext<ModesState | null>(null);
