import type {
  ModeAction,
  ModeActionInput,
  ModeActionPhase,
  ModeActionRepeatPolicy
} from '../../shared/modes';
import { normalizeOpenUrl } from '../../shared/open-url';
import { getRequiredString, isRecord, type JsonRecord } from './json-record';

type CreateError = (message: string) => Error;
type ModeActionInputParser = (
  value: JsonRecord,
  path: string,
  createError: CreateError
) => ModeActionInput;

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

  if (!isModeActionType(type)) {
    throw createError(`${path}.type must be a supported action type.`);
  }

  return modeActionInputParsers[type](value, path, createError);
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

const parseOpenAppModeActionInput = (
  value: JsonRecord,
  path: string,
  createError: CreateError
): ModeActionInput => {
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
    type: 'open-app'
  };
};

const parseOpenUrlModeActionInput = (
  value: JsonRecord,
  path: string,
  createError: CreateError
): ModeActionInput => {
  const url = normalizeOpenUrl(getRequiredModeActionString(value, 'url', path, createError));
  const label = getOptionalModeActionString(value, 'label', path, createError);

  if (url === null) {
    throw createError(`${path}.url must be a valid http/https URL or Spotify link.`);
  }

  return {
    enabled: getRequiredModeActionBoolean(value, 'enabled', path, createError),
    ...(label === undefined ? {} : { label }),
    repeatPolicy: parseModeActionRepeatPolicy(value.repeatPolicy, path, createError),
    type: 'open-url',
    url
  };
};

const modeActionInputParsers = {
  'open-app': parseOpenAppModeActionInput,
  'open-url': parseOpenUrlModeActionInput
} satisfies Record<ModeAction['type'], ModeActionInputParser>;

function isModeActionType(type: string): type is ModeAction['type'] {
  return type in modeActionInputParsers;
}

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
