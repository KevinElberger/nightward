import type { ModeActionInput, ModeActionPhase, ModeState, SavedMode } from './modes';

export const MODE_IPC_CHANNELS = {
  getState: 'modes:get-state',
  list: 'modes:list',
  create: 'modes:create',
  rename: 'modes:rename',
  setPinned: 'modes:set-pinned',
  delete: 'modes:delete',
  activate: 'modes:activate',
  deactivate: 'modes:deactivate',
  createAction: 'modes:create-action',
  updateAction: 'modes:update-action',
  deleteAction: 'modes:delete-action'
} as const;

export const MODE_IPC_EVENTS = {
  stateChanged: 'modes:state-changed'
} as const;

export type CreateModeRequest = {
  name: string;
};

export type RenameModeRequest = {
  id: string;
  name: string;
};

export type SetModePinnedRequest = {
  id: string;
  isPinned: boolean;
};

export type DeleteModeRequest = {
  id: string;
};

export type ActivateModeRequest = {
  id: string;
};

export type CreateModeActionRequest = {
  modeId: string;
  phase: ModeActionPhase;
  action: ModeActionInput;
};

export type UpdateModeActionRequest = {
  modeId: string;
  phase: ModeActionPhase;
  actionId: string;
  action: ModeActionInput;
};

export type DeleteModeActionRequest = {
  modeId: string;
  phase: ModeActionPhase;
  actionId: string;
};

export type GetModeStateResponse = ModeState;
export type ListModesResponse = SavedMode[];
export type CreateModeResponse = SavedMode;
export type RenameModeResponse = SavedMode | null;
export type SetModePinnedResponse = SavedMode | null;
export type DeleteModeResponse = boolean;
export type ActivateModeResponse = boolean;
export type DeactivateModeResponse = boolean;
export type CreateModeActionResponse = SavedMode | null;
export type UpdateModeActionResponse = SavedMode | null;
export type DeleteModeActionResponse = SavedMode | null;
export type ModeStateChangedPayload = ModeState;
