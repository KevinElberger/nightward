import {
  createEmptyModeActionSet,
  type ModeAction,
  type ModeActionRepeatPolicy,
  type ModeActionSet
} from '@shared/modes';
import { getRequiredString, isRecord, type JsonRecord } from '../validation/json-record';
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
  if (!isRecord(value)) {
    throw new AppDataStoreError(`${actionPath} must be a JSON object.`);
  }

  const type = getRequiredAppDataString(value, 'type', actionPath);

  if (type !== 'open-app') {
    throw new AppDataStoreError(`${actionPath}.type must be a supported action type.`);
  }

  const bundleId = getOptionalAppDataString(value, 'bundleId', actionPath);

  return {
    appName: getRequiredAppDataString(value, 'appName', actionPath),
    appPath: getRequiredAppDataString(value, 'appPath', actionPath),
    ...(bundleId === undefined ? {} : { bundleId }),
    enabled: getRequiredBoolean(value, 'enabled', actionPath),
    id: getRequiredAppDataString(value, 'id', actionPath),
    onlyOpenIfNotRunning: getRequiredBoolean(value, 'onlyOpenIfNotRunning', actionPath),
    repeatPolicy: validateRepeatPolicy(value.repeatPolicy, actionPath),
    type
  };
};

const validateRepeatPolicy = (
  value: unknown,
  actionPath: string
): ModeActionRepeatPolicy => {
  if (value === 'every-activation' || value === 'once-per-day') {
    return value;
  }

  throw new AppDataStoreError(`${actionPath}.repeatPolicy must be a supported repeat policy.`);
};

const getRequiredAppDataString = (record: JsonRecord, property: string, recordPath: string) =>
  getRequiredString({
    createError: (message) => new AppDataStoreError(message),
    label: recordPath,
    record,
    property
  });

const getOptionalAppDataString = (record: JsonRecord, property: string, recordPath: string) => {
  const value = record[property];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw new AppDataStoreError(`${recordPath}.${property} must be a non-empty string.`);
  }

  return value;
};

const getRequiredBoolean = (record: JsonRecord, property: string, recordPath: string) => {
  const value = record[property];

  if (typeof value !== 'boolean') {
    throw new AppDataStoreError(`${recordPath}.${property} must be a boolean.`);
  }

  return value;
};
