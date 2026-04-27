import { vi } from 'vitest';
import { createModeAutomationResult } from '../../shared/mode-automation';
import type { NightwardApi } from '../../shared/nightward-api';

type ModesApiOverrides = Partial<NightwardApi['modes']>;
type ApplicationsApiOverrides = Partial<NightwardApi['applications']>;

type ApiOverrides = {
  applications?: ApplicationsApiOverrides;
  modes?: ModesApiOverrides;
};

export const createApiMock = (overrides: ApiOverrides = {}): NightwardApi => ({
  modes: {
    getState: vi.fn().mockResolvedValue({
      activeModeId: null,
      modes: []
    }),
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    rename: vi.fn(),
    setPinned: vi.fn(),
    delete: vi.fn(),
    activate: vi.fn().mockResolvedValue(createModeAutomationResult(false)),
    deactivate: vi.fn().mockResolvedValue(createModeAutomationResult(false)),
    createAction: vi.fn(),
    updateAction: vi.fn(),
    deleteAction: vi.fn(),
    onChanged: vi.fn(() => vi.fn()),
    ...overrides.modes
  },
  applications: {
    getIcon: vi.fn().mockResolvedValue(null),
    select: vi.fn().mockResolvedValue(null),
    ...overrides.applications
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
