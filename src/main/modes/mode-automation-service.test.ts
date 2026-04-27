import { describe, expect, it, vi } from 'vitest';
import {
  buildModeActionSet,
  buildOpenAppModeAction,
  buildSavedMode
} from '@test/builders/shared/modes';
import { createModeAutomationResult } from '../../shared/mode-automation';
import type { ModeService } from './mode-service';
import type { ModeActionRunner } from './mode-action-runner';
import { ModeAutomationService } from './mode-automation-service';

const startAction = buildOpenAppModeAction({ id: 'start-action' });
const endAction = buildOpenAppModeAction({ id: 'end-action' });
const focusMode = buildSavedMode({
  actions: buildModeActionSet({
    enter: [startAction],
    exit: [endAction]
  }),
  id: 'focus-mode'
});
const restMode = buildSavedMode({
  actions: buildModeActionSet({
    enter: [buildOpenAppModeAction({ id: 'rest-start-action' })],
    exit: [buildOpenAppModeAction({ id: 'rest-end-action' })]
  }),
  id: 'rest-mode',
  name: 'Rest'
});

const createModeAutomationService = ({
  activeModeId = null,
  activateSavedMode = vi.fn(async (modeId: string) => {
    activeModeId = modeId;
    return true;
  }),
  deactivateActiveMode = vi.fn(async () => {
    activeModeId = null;
    return true;
  })
}: {
  activeModeId?: string | null;
  activateSavedMode?: (modeId: string) => Promise<boolean>;
  deactivateActiveMode?: () => Promise<boolean>;
} = {}) => {
  const modes = [focusMode, restMode];
  const modeService = {
    activateSavedMode,
    deactivateActiveMode,
    getModeState: vi.fn(() => ({
      activeModeId,
      modes
    })),
    getSavedModes: vi.fn(() => modes)
  } as unknown as ModeService;
  const actionRunner = {
    runActions: vi.fn().mockResolvedValue([])
  } as unknown as ModeActionRunner;
  const automationService = new ModeAutomationService({
    actionRunner,
    modeService
  });

  return { actionRunner, automationService, modeService };
};

describe('ModeAutomationService', () => {
  it('runs enter actions when a mode activates', async () => {
    const { actionRunner, automationService } = createModeAutomationService();

    await expect(automationService.activateMode('focus-mode')).resolves.toEqual(
      createModeAutomationResult(true)
    );

    expect(actionRunner.runActions).toHaveBeenCalledWith([startAction]);
  });

  it('runs exit actions before enter actions when switching modes', async () => {
    const { actionRunner, automationService } = createModeAutomationService({
      activeModeId: 'rest-mode'
    });

    await expect(automationService.activateMode('focus-mode')).resolves.toEqual(
      createModeAutomationResult(true)
    );

    expect(actionRunner.runActions).toHaveBeenNthCalledWith(1, restMode.actions.exit);
    expect(actionRunner.runActions).toHaveBeenNthCalledWith(2, focusMode.actions.enter);
  });

  it('does not rerun actions when activating the already active mode', async () => {
    const { actionRunner, automationService } = createModeAutomationService({
      activeModeId: 'focus-mode'
    });

    await expect(automationService.activateMode('focus-mode')).resolves.toEqual(
      createModeAutomationResult(true)
    );

    expect(actionRunner.runActions).not.toHaveBeenCalled();
  });

  it('runs exit actions when a mode deactivates', async () => {
    const { actionRunner, automationService } = createModeAutomationService({
      activeModeId: 'focus-mode'
    });

    await expect(automationService.deactivateMode()).resolves.toEqual(
      createModeAutomationResult(true)
    );

    expect(actionRunner.runActions).toHaveBeenCalledWith([endAction]);
  });

  it('does not run actions when mode state does not change', async () => {
    const { actionRunner, automationService } = createModeAutomationService({
      activateSavedMode: vi.fn().mockResolvedValue(false),
      deactivateActiveMode: vi.fn().mockResolvedValue(false)
    });

    await expect(automationService.activateMode('focus-mode')).resolves.toEqual(
      createModeAutomationResult(false)
    );
    await expect(automationService.deactivateMode()).resolves.toEqual(
      createModeAutomationResult(false)
    );

    expect(actionRunner.runActions).not.toHaveBeenCalled();
  });

  it('includes action failures when a mode action fails', async () => {
    const { actionRunner, automationService } = createModeAutomationService();
    actionRunner.runActions = vi.fn().mockResolvedValue([
      {
        action: startAction,
        message: 'The app could not be opened.'
      }
    ]);

    await expect(automationService.activateMode('focus-mode')).resolves.toEqual(
      createModeAutomationResult(true, [
        {
          actionId: startAction.id,
          actionType: 'open-app',
          appName: startAction.appName,
          message: 'The app could not be opened.',
          modeId: focusMode.id,
          modeName: focusMode.name,
          phase: 'enter'
        }
      ])
    );
  });
});
