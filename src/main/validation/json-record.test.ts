import { describe, expect, it } from 'vitest';
import { getRequiredString, isRecord } from './json-record';

class TestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestValidationError';
  }
}

const createError = (message: string) => new TestValidationError(message);

describe('json record validation helpers', () => {
  describe('isRecord', () => {
    it('returns true for plain objects', () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ key: 'value' })).toBe(true);
    });

    it('returns false for null, arrays, and primitives', () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord([])).toBe(false);
      expect(isRecord('value')).toBe(false);
      expect(isRecord(42)).toBe(false);
      expect(isRecord(true)).toBe(false);
      expect(isRecord(undefined)).toBe(false);
    });
  });

  describe('getRequiredString', () => {
    it('returns string properties without trimming returned values', () => {
      expect(
        getRequiredString({
          createError,
          label: 'request',
          record: {
            name: '  Focus  '
          },
          property: 'name'
        })
      ).toBe('  Focus  ');
    });

    it('throws custom errors for missing properties', () => {
      expect(() =>
        getRequiredString({
          createError,
          label: 'request',
          record: {},
          property: 'name'
        })
      ).toThrow(TestValidationError);
      expect(() =>
        getRequiredString({
          createError,
          label: 'request',
          record: {},
          property: 'name'
        })
      ).toThrow('request.name must be a non-empty string.');
    });

    it('throws custom errors for blank string properties', () => {
      expect(() =>
        getRequiredString({
          createError,
          label: 'request',
          record: {
            name: '   '
          },
          property: 'name'
        })
      ).toThrow(TestValidationError);
    });

    it('throws custom errors for non-string properties', () => {
      expect(() =>
        getRequiredString({
          createError,
          label: 'request',
          record: {
            name: 123
          },
          property: 'name'
        })
      ).toThrow(TestValidationError);
    });
  });
});
