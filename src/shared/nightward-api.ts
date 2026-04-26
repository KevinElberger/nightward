import type {
  ActivateModeResponse,
  CreateModeActionResponse,
  CreateModeResponse,
  DeactivateModeResponse,
  DeleteModeActionResponse,
  DeleteModeResponse,
  GetApplicationIconResponse,
  GetModeStateResponse,
  ListModesResponse,
  ModeStateChangedPayload,
  RenameModeResponse,
  UpdateModeActionResponse,
  SelectApplicationResponse,
  SetModePinnedResponse
} from './mode-ipc';
import type { ModeActionInput, ModeActionPhase } from './modes';

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
    createAction(
      modeId: string,
      phase: ModeActionPhase,
      action: ModeActionInput
    ): Promise<CreateModeActionResponse>;
    updateAction(
      modeId: string,
      phase: ModeActionPhase,
      actionId: string,
      action: ModeActionInput
    ): Promise<UpdateModeActionResponse>;
    deleteAction(
      modeId: string,
      phase: ModeActionPhase,
      actionId: string
    ): Promise<DeleteModeActionResponse>;
    onChanged(listener: (modeState: ModeStateChangedPayload) => void): () => void;
  };
  applications: {
    getIcon(appPath: string): Promise<GetApplicationIconResponse>;
    select(): Promise<SelectApplicationResponse>;
  };
};
