import type {
  ActivateModeResponse,
  CreateModeResponse,
  DeactivateModeResponse,
  DeleteModeResponse,
  GetModeStateResponse,
  ListModesResponse,
  RenameModeResponse
} from './mode-ipc';

export type NightwardApi = {
  modes: {
    getState(): Promise<GetModeStateResponse>;
    list(): Promise<ListModesResponse>;
    create(name: string): Promise<CreateModeResponse>;
    rename(id: string, name: string): Promise<RenameModeResponse>;
    delete(id: string): Promise<DeleteModeResponse>;
    activate(id: string): Promise<ActivateModeResponse>;
    deactivate(): Promise<DeactivateModeResponse>;
  };
};
