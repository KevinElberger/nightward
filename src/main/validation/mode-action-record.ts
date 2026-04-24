import type {
  ModeAction,
  ModeActionInput,
  ModeActionPhase,
  ModeActionRepeatPolicy
} from '../../shared/modes';
import { getRequiredString, isRecord, type JsonRecord } from './json-record';

type CreateError = (message: string) => Error;

export const parseModeActionPhase = (
  value: unknown,
  path: string,
  createError: CreateError
): ModeActionPhase => {
  if (value === 'enter' || value === 'exit') {
    return value;
  }

  throw createError(`${path} must be "enter" or "exit".`);
};

export const parseModeActionInput = (
  value: unknown,
  path: string,
  createError: CreateError
): ModeActionInput => {
  if (!isRecord(value)) {
    throw createError(`${path} must be a JSON object.`);
  }

  const type = getRequiredModeActionString(value, 'type', path, createError);

  if (type !== 'open-app') {
    throw createError(`${path}.type must be a supported action type.`);
  }

  const bundleId = getOptionalModeActionString(value, 'bundleId', path, createError);

  return {
    appName: getRequiredModeActionString(value, 'appName', path, createError),
    appPath: getRequiredModeActionString(value, 'appPath', path, createError),
    ...(bundleId === undefined ? {} : { bundleId }),
    enabled: getRequiredModeActionBoolean(value, 'enabled', path, createError),
    onlyOpenIfNotRunning: getRequiredModeActionBoolean(
      value,
      'onlyOpenIfNotRunning',
      path,
      createError
    ),
    repeatPolicy: parseModeActionRepeatPolicy(value.repeatPolicy, path, createError),
    type
  };
};

export const parseModeAction = (
  value: unknown,
  path: string,
  createError: CreateError
): ModeAction => {
  if (!isRecord(value)) {
    throw createError(`${path} must be a JSON object.`);
  }

  return {
    ...parseModeActionInput(value, path, createError),
    id: getRequiredModeActionString(value, 'id', path, createError)
  };
};

const parseModeActionRepeatPolicy = (
  value: unknown,
  path: string,
  createError: CreateError
): ModeActionRepeatPolicy => {
  if (value === 'every-activation' || value === 'once-per-day') {
    return value;
  }

  throw createError(`${path}.repeatPolicy must be a supported repeat policy.`);
};

const getRequiredModeActionString = (
  record: JsonRecord,
  property: string,
  path: string,
  createError: CreateError
) =>
  getRequiredString({
    createError,
    label: path,
    record,
    property
  });

const getOptionalModeActionString = (
  record: JsonRecord,
  property: string,
  path: string,
  createError: CreateError
) => {
  const value = record[property];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw createError(`${path}.${property} must be a non-empty string.`);
  }

  return value;
};

const getRequiredModeActionBoolean = (
  record: JsonRecord,
  property: string,
  path: string,
  createError: CreateError
) => {
  const value = record[property];

  if (typeof value !== 'boolean') {
    throw createError(`${path}.${property} must be a boolean.`);
  }

  return value;
};
