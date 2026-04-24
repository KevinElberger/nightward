import {
  createEmptyModeActionSet,
  type ModeAction,
  type ModeActionSet
} from '@shared/modes';
import { isRecord } from '../validation/json-record';
import { parseModeAction } from '../validation/mode-action-record';
import { AppDataStoreError } from './app-data-store-error';

export const validateModeActionSet = (value: unknown, modePath: string): ModeActionSet => {
  if (value === undefined || value === null) {
    return createEmptyModeActionSet();
  }

  if (!isRecord(value)) {
    throw new AppDataStoreError(`${modePath}.actions must be a JSON object.`);
  }

  return {
    enter: validateModeActionList(value.enter, `${modePath}.actions.enter`),
    exit: validateModeActionList(value.exit, `${modePath}.actions.exit`)
  };
};

const validateModeActionList = (value: unknown, actionListPath: string): ModeAction[] => {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new AppDataStoreError(`${actionListPath} must be an array.`);
  }

  return value.map((action, index) => validateModeAction(action, `${actionListPath}[${index}]`));
};

const validateModeAction = (value: unknown, actionPath: string): ModeAction => {
  return parseModeAction(value, actionPath, (message) => new AppDataStoreError(message));
};
