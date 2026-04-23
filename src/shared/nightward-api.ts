import type {
  ActivateModeResponse,
  CreateModeResponse,
  DeactivateModeResponse,
  DeleteModeResponse,
  GetModeStateResponse,
  ListModesResponse,
  ModeStateChangedPayload,
  RenameModeResponse,
  SetModePinnedResponse
} from './mode-ipc';

export type NightwardApi = {
  modes: {
    getState(): Promise<GetModeStateResponse>;
    list(): Promise<ListModesResponse>;
    create(name: string): Promise<CreateModeResponse>;
    rename(id: string, name: string): Promise<RenameModeResponse>;
    setPinned(id: string, isPinned: boolean): Promise<SetModePinnedResponse>;
    delete(id: string): Promise<DeleteModeResponse>;
    activate(id: string): Promise<ActivateModeResponse>;
    deactivate(): Promise<DeactivateModeResponse>;
    onChanged(listener: (modeState: ModeStateChangedPayload) => void): () => void;
  };
};
