import type { SavedMode } from './modes';

export const MODE_IPC_CHANNELS = {
  list: 'modes:list',
  create: 'modes:create',
  rename: 'modes:rename',
  delete: 'modes:delete',
  activate: 'modes:activate'
} as const;

export type CreateModeRequest = {
  name: string;
};

export type RenameModeRequest = {
  id: string;
  name: string;
};

export type DeleteModeRequest = {
  id: string;
};

export type ActivateModeRequest = {
  id: string;
};

export type ListModesResponse = SavedMode[];
export type CreateModeResponse = SavedMode;
export type RenameModeResponse = SavedMode | null;
export type DeleteModeResponse = boolean;
export type ActivateModeResponse = boolean;
