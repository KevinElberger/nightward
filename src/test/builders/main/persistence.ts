import { createEmptyModeActionSet } from '@shared/modes';
import {
  CURRENT_APP_DATA_SCHEMA_VERSION,
  type AppData,
  type PersistedMode
} from '../../../main/persistence/types';

export const buildPersistedMode = (overrides: Partial<PersistedMode> = {}): PersistedMode => ({
  actions: createEmptyModeActionSet(),
  createdAt: '2024-01-01T00:00:00.000Z',
  id: 'mode-1',
  name: 'Focus',
  pinnedAt: null,
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides
});

type AppDataOverrides = Omit<Partial<AppData>, 'modes'> & {
  modes?: PersistedMode[];
};

export const buildAppData = (overrides: AppDataOverrides = {}): AppData => ({
  schemaVersion: CURRENT_APP_DATA_SCHEMA_VERSION,
  modes: [buildPersistedMode()],
  ...overrides
});
