import type { IpcMain } from 'electron';
import {
  MODE_IPC_CHANNELS,
  type ActivateModeRequest,
  type CreateModeRequest,
  type DeleteModeRequest,
  type RenameModeRequest
} from '../../shared/mode-ipc';
import type { ModeService } from '../modes/mode-service';
import { getRequiredString, isRecord } from '../validation/json-record';

type IpcMainRouter = Pick<IpcMain, 'handle' | 'removeHandler'>;

type RegisterModeIpcHandlersOptions = {
  ipcMain: IpcMainRouter;
  modeService: ModeService;
  onModesChanged: () => void;
};

export class ModeIpcHandlerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModeIpcHandlerError';
  }
}

export const registerModeIpcHandlers = ({
  ipcMain,
  modeService,
  onModesChanged
}: RegisterModeIpcHandlersOptions) => {
  ipcMain.handle(MODE_IPC_CHANNELS.getState, () => modeService.getModeState());

  ipcMain.handle(MODE_IPC_CHANNELS.list, () => modeService.getSavedModes());

  ipcMain.handle(MODE_IPC_CHANNELS.create, async (_event, request: unknown) => {
    const mode = await modeService.createMode(parseCreateModeRequest(request).name);
    onModesChanged();

    return mode;
  });

  ipcMain.handle(MODE_IPC_CHANNELS.rename, async (_event, request: unknown) => {
    const { id, name } = parseRenameModeRequest(request);
    const mode = await modeService.renameMode(id, name);

    if (mode !== null) {
      onModesChanged();
    }

    return mode;
  });

  ipcMain.handle(MODE_IPC_CHANNELS.delete, async (_event, request: unknown) => {
    const deleted = await modeService.deleteMode(parseDeleteModeRequest(request).id);

    if (deleted) {
      onModesChanged();
    }

    return deleted;
  });

  ipcMain.handle(MODE_IPC_CHANNELS.activate, async (_event, request: unknown) => {
    const activated = await modeService.activateSavedMode(parseActivateModeRequest(request).id);

    if (activated) {
      onModesChanged();
    }

    return activated;
  });

  ipcMain.handle(MODE_IPC_CHANNELS.deactivate, async () => {
    const deactivated = await modeService.deactivateActiveMode();

    if (deactivated) {
      onModesChanged();
    }

    return deactivated;
  });

  return () => {
    Object.values(MODE_IPC_CHANNELS).forEach((channel) => {
      ipcMain.removeHandler(channel);
    });
  };
};

const parseCreateModeRequest = (request: unknown): CreateModeRequest => ({
  name: getStringProperty(request, 'name', MODE_IPC_CHANNELS.create)
});

const parseRenameModeRequest = (request: unknown): RenameModeRequest => ({
  id: getStringProperty(request, 'id', MODE_IPC_CHANNELS.rename),
  name: getStringProperty(request, 'name', MODE_IPC_CHANNELS.rename)
});

const parseDeleteModeRequest = (request: unknown): DeleteModeRequest => ({
  id: getStringProperty(request, 'id', MODE_IPC_CHANNELS.delete)
});

const parseActivateModeRequest = (request: unknown): ActivateModeRequest => ({
  id: getStringProperty(request, 'id', MODE_IPC_CHANNELS.activate)
});

const getStringProperty = (request: unknown, property: string, channel: string) => {
  if (!isRecord(request)) {
    throw new ModeIpcHandlerError(`${channel} requires an object request.`);
  }

  return getRequiredString({
    createError: (message) => new ModeIpcHandlerError(message),
    label: channel,
    record: request,
    property
  });
};
