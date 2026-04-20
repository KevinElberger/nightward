export type JsonRecord = Record<string, unknown>;

type GetRequiredStringOptions = {
  createError: (message: string) => Error;
  label: string;
  record: JsonRecord;
  property: string;
};

export const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const getRequiredString = ({
  createError,
  label,
  record,
  property
}: GetRequiredStringOptions) => {
  const value = record[property];

  if (typeof value !== 'string' || value.trim() === '') {
    throw createError(`${label}.${property} must be a non-empty string.`);
  }

  return value;
};
