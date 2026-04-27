import { vi } from 'vitest';
import type { ModeAutomationService } from '../../../main/modes/mode-automation-service';

type ModeAutomationServiceDouble = Pick<ModeAutomationService, 'activateMode' | 'deactivateMode'>;

type ModeAutomationServiceDoubleOverrides = Partial<ModeAutomationServiceDouble>;

export const buildModeAutomationServiceDouble = (
  overrides: ModeAutomationServiceDoubleOverrides = {}
): ModeAutomationServiceDouble => ({
  activateMode: vi.fn().mockResolvedValue(true),
  deactivateMode: vi.fn().mockResolvedValue(true),
  ...overrides
});
