import { vi } from 'vitest';
import { createModeAutomationResult } from '../../../shared/mode-automation';
import type { ModeAutomationService } from '../../../main/modes/mode-automation-service';

type ModeAutomationServiceDouble = Pick<ModeAutomationService, 'activateMode' | 'deactivateMode'>;

type ModeAutomationServiceDoubleOverrides = Partial<ModeAutomationServiceDouble>;

export const buildModeAutomationServiceDouble = (
  overrides: ModeAutomationServiceDoubleOverrides = {}
): ModeAutomationServiceDouble => ({
  activateMode: vi.fn().mockResolvedValue(createModeAutomationResult(true)),
  deactivateMode: vi.fn().mockResolvedValue(createModeAutomationResult(true)),
  ...overrides
});
