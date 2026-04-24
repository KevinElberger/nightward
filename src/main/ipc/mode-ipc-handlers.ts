import type { IpcMain } from 'electron';
import {
  MODE_IPC_CHANNELS,
  type ActivateModeRequest,
  type CreateModeActionRequest,
  type CreateModeRequest,
  type DeleteModeActionRequest,
  type DeleteModeRequest,
  type RenameModeRequest,
  type SetModePinnedRequest,
  type UpdateModeActionRequest
} from '../../shared/mode-ipc';
import type { ModeService } from '../modes/mode-service';
import { parseModeActionInput, parseModeActionPhase } from '../validation/mode-action-record';
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

  ipcMain.handle(MODE_IPC_CHANNELS.setPinned, async (_event, request: unknown) => {
    const { id, isPinned } = parseSetModePinnedRequest(request);
    const mode = await modeService.setModePinned(id, isPinned);

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

  ipcMain.handle(MODE_IPC_CHANNELS.createAction, async (_event, request: unknown) => {
    const { action, modeId, phase } = parseCreateModeActionRequest(request);
    const mode = await modeService.createModeAction(modeId, phase, action);

    if (mode !== null) {
      onModesChanged();
    }

    return mode;
  });

  ipcMain.handle(MODE_IPC_CHANNELS.updateAction, async (_event, request: unknown) => {
    const { action, actionId, modeId, phase } = parseUpdateModeActionRequest(request);
    const mode = await modeService.updateModeAction(modeId, phase, actionId, action);

    if (mode !== null) {
      onModesChanged();
    }

    return mode;
  });

  ipcMain.handle(MODE_IPC_CHANNELS.deleteAction, async (_event, request: unknown) => {
    const { actionId, modeId, phase } = parseDeleteModeActionRequest(request);
    const mode = await modeService.deleteModeAction(modeId, phase, actionId);

    if (mode !== null) {
      onModesChanged();
    }

    return mode;
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

const parseSetModePinnedRequest = (request: unknown): SetModePinnedRequest => ({
  id: getStringProperty(request, 'id', MODE_IPC_CHANNELS.setPinned),
  isPinned: getBooleanProperty(request, 'isPinned', MODE_IPC_CHANNELS.setPinned)
});

const parseDeleteModeRequest = (request: unknown): DeleteModeRequest => ({
  id: getStringProperty(request, 'id', MODE_IPC_CHANNELS.delete)
});

const parseActivateModeRequest = (request: unknown): ActivateModeRequest => ({
  id: getStringProperty(request, 'id', MODE_IPC_CHANNELS.activate)
});

const parseCreateModeActionRequest = (request: unknown): CreateModeActionRequest => {
  const record = getRecordRequest(request, MODE_IPC_CHANNELS.createAction);

  return {
    action: parseModeActionInput(
      record.action,
      `${MODE_IPC_CHANNELS.createAction}.action`,
      (message) => new ModeIpcHandlerError(message)
    ),
    modeId: getStringProperty(record, 'modeId', MODE_IPC_CHANNELS.createAction),
    phase: parseModeActionPhase(
      record.phase,
      `${MODE_IPC_CHANNELS.createAction}.phase`,
      (message) => new ModeIpcHandlerError(message)
    )
  };
};

const parseUpdateModeActionRequest = (request: unknown): UpdateModeActionRequest => {
  const record = getRecordRequest(request, MODE_IPC_CHANNELS.updateAction);

  return {
    action: parseModeActionInput(
      record.action,
      `${MODE_IPC_CHANNELS.updateAction}.action`,
      (message) => new ModeIpcHandlerError(message)
    ),
    actionId: getStringProperty(record, 'actionId', MODE_IPC_CHANNELS.updateAction),
    modeId: getStringProperty(record, 'modeId', MODE_IPC_CHANNELS.updateAction),
    phase: parseModeActionPhase(
      record.phase,
      `${MODE_IPC_CHANNELS.updateAction}.phase`,
      (message) => new ModeIpcHandlerError(message)
    )
  };
};

const parseDeleteModeActionRequest = (request: unknown): DeleteModeActionRequest => {
  const record = getRecordRequest(request, MODE_IPC_CHANNELS.deleteAction);

  return {
    actionId: getStringProperty(record, 'actionId', MODE_IPC_CHANNELS.deleteAction),
    modeId: getStringProperty(record, 'modeId', MODE_IPC_CHANNELS.deleteAction),
    phase: parseModeActionPhase(
      record.phase,
      `${MODE_IPC_CHANNELS.deleteAction}.phase`,
      (message) => new ModeIpcHandlerError(message)
    )
  };
};

const getRecordRequest = (request: unknown, channel: string) => {
  if (!isRecord(request)) {
    throw new ModeIpcHandlerError(`${channel} requires an object request.`);
  }

  return request;
};

const getStringProperty = (request: unknown, property: string, channel: string) => {
  return getRequiredString({
    createError: (message) => new ModeIpcHandlerError(message),
    label: channel,
    record: getRecordRequest(request, channel),
    property
  });
};

const getBooleanProperty = (request: unknown, property: string, channel: string) => {
  const value = getRecordRequest(request, channel)[property];

  if (typeof value !== 'boolean') {
    throw new ModeIpcHandlerError(`${channel}.${property} must be a boolean.`);
  }

  return value;
};
