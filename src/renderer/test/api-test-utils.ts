import { vi } from 'vitest';
import type { NightwardApi } from '../../shared/nightward-api';

type ModesApiOverrides = Partial<NightwardApi['modes']>;

type ApiOverrides = {
  modes?: ModesApiOverrides;
};

export const createApiMock = (overrides: ApiOverrides = {}): NightwardApi => ({
  modes: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    rename: vi.fn(),
    delete: vi.fn(),
    activate: vi.fn(),
    ...overrides.modes
  }
});

export const installApiMock = (overrides: ApiOverrides = {}) => {
  const api = createApiMock(overrides);

  Object.defineProperty(window, 'nightward', {
    configurable: true,
    value: api
  });

  return api;
};

export const clearApiMock = () => {
  Reflect.deleteProperty(window, 'nightward');
};
