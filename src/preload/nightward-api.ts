import {
  MODE_IPC_CHANNELS,
  MODE_IPC_EVENTS,
  type ActivateModeRequest,
  type ActivateModeResponse,
  type CreateModeRequest,
  type CreateModeResponse,
  type DeactivateModeResponse,
  type DeleteModeRequest,
  type DeleteModeResponse,
  type GetModeStateResponse,
  type ListModesResponse,
  type ModeStateChangedPayload,
  type RenameModeRequest,
  type RenameModeResponse,
  type SetModePinnedRequest,
  type SetModePinnedResponse
} from '../shared/mode-ipc';
import type { NightwardApi } from '../shared/nightward-api';

type IpcRendererListener = (event: unknown, payload: unknown) => void;

type IpcRendererBridge = {
  invoke(channel: string, request?: unknown): Promise<unknown>;
  on(channel: string, listener: IpcRendererListener): void;
  removeListener(channel: string, listener: IpcRendererListener): void;
};

export const createNightwardApi = (ipcRenderer: IpcRendererBridge): NightwardApi => ({
  modes: {
    getState: () => ipcRenderer.invoke(MODE_IPC_CHANNELS.getState) as Promise<GetModeStateResponse>,
    list: () => ipcRenderer.invoke(MODE_IPC_CHANNELS.list) as Promise<ListModesResponse>,
    create: (name) =>
      ipcRenderer.invoke(MODE_IPC_CHANNELS.create, {
        name
      } satisfies CreateModeRequest) as Promise<CreateModeResponse>,
    rename: (id, name) =>
      ipcRenderer.invoke(MODE_IPC_CHANNELS.rename, {
        id,
        name
      } satisfies RenameModeRequest) as Promise<RenameModeResponse>,
    setPinned: (id, isPinned) =>
      ipcRenderer.invoke(MODE_IPC_CHANNELS.setPinned, {
        id,
        isPinned
      } satisfies SetModePinnedRequest) as Promise<SetModePinnedResponse>,
    delete: (id) =>
      ipcRenderer.invoke(MODE_IPC_CHANNELS.delete, {
        id
      } satisfies DeleteModeRequest) as Promise<DeleteModeResponse>,
    activate: (id) =>
      ipcRenderer.invoke(MODE_IPC_CHANNELS.activate, {
        id
      } satisfies ActivateModeRequest) as Promise<ActivateModeResponse>,
    deactivate: () =>
      ipcRenderer.invoke(MODE_IPC_CHANNELS.deactivate) as Promise<DeactivateModeResponse>,
    onChanged: (listener) => {
      const ipcListener: IpcRendererListener = (_event, payload) => {
        listener(payload as ModeStateChangedPayload);
      };

      ipcRenderer.on(MODE_IPC_EVENTS.stateChanged, ipcListener);

      return () => {
        ipcRenderer.removeListener(MODE_IPC_EVENTS.stateChanged, ipcListener);
      };
    }
  }
});
