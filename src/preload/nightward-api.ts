import {
  MODE_IPC_CHANNELS,
  type ActivateModeRequest,
  type ActivateModeResponse,
  type CreateModeRequest,
  type CreateModeResponse,
  type DeleteModeRequest,
  type DeleteModeResponse,
  type ListModesResponse,
  type RenameModeRequest,
  type RenameModeResponse
} from '../shared/mode-ipc';
import type { NightwardApi } from '../shared/nightward-api';

type IpcInvoker = {
  invoke(channel: string, request?: unknown): Promise<unknown>;
};

export const createNightwardApi = (ipcRenderer: IpcInvoker): NightwardApi => ({
  modes: {
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
    delete: (id) =>
      ipcRenderer.invoke(MODE_IPC_CHANNELS.delete, {
        id
      } satisfies DeleteModeRequest) as Promise<DeleteModeResponse>,
    activate: (id) =>
      ipcRenderer.invoke(MODE_IPC_CHANNELS.activate, {
        id
      } satisfies ActivateModeRequest) as Promise<ActivateModeResponse>
  }
});
