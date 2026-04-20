import type {
  ActivateModeResponse,
  CreateModeResponse,
  DeleteModeResponse,
  ListModesResponse,
  RenameModeResponse
} from './mode-ipc';

export type NightwardApi = {
  modes: {
    list(): Promise<ListModesResponse>;
    create(name: string): Promise<CreateModeResponse>;
    rename(id: string, name: string): Promise<RenameModeResponse>;
    delete(id: string): Promise<DeleteModeResponse>;
    activate(id: string): Promise<ActivateModeResponse>;
  };
};
