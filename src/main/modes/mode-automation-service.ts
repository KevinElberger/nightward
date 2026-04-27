import {
  createModeAutomationResult,
  type ModeActionFailure,
  type ModeAutomationResult
} from '../../shared/mode-automation';
import type { ModeActionPhase, SavedMode } from '@shared/modes';
import type { ModeService } from './mode-service';
import type { ModeActionRunner } from './mode-action-runner';

type ModeAutomationServiceOptions = {
  actionRunner: ModeActionRunner;
  modeService: ModeService;
};

export class ModeAutomationService {
  private readonly actionRunner: ModeActionRunner;
  private readonly modeService: ModeService;

  constructor({ actionRunner, modeService }: ModeAutomationServiceOptions) {
    this.actionRunner = actionRunner;
    this.modeService = modeService;
  }

  readonly activateMode = async (modeId: string): Promise<ModeAutomationResult> => {
    const previousActiveMode = this.getActiveMode();
    const activated = await this.modeService.activateSavedMode(modeId);

    if (!activated) {
      return createModeAutomationResult(false);
    }

    const activatedMode = this.getModeById(modeId);

    if (previousActiveMode?.id === activatedMode?.id) {
      return createModeAutomationResult(true);
    }

    const actionFailures = [
      ...(await this.runModePhase(previousActiveMode, 'exit')),
      ...(await this.runModePhase(activatedMode, 'enter'))
    ];

    return createModeAutomationResult(true, actionFailures);
  };

  readonly deactivateMode = async (): Promise<ModeAutomationResult> => {
    const previousActiveMode = this.getActiveMode();
    const deactivated = await this.modeService.deactivateActiveMode();

    if (!deactivated) {
      return createModeAutomationResult(false);
    }

    const actionFailures = await this.runModePhase(previousActiveMode, 'exit');

    return createModeAutomationResult(true, actionFailures);
  };

  private async runModePhase(mode: SavedMode | null, phase: ModeActionPhase) {
    if (mode === null) {
      return [];
    }

    const failures = await this.actionRunner.runActions(mode.actions[phase]);

    return failures.map(({ action, message }): ModeActionFailure => {
      const appName = action.type === 'open-app' ? action.appName : null;

      return {
        actionId: action.id,
        actionType: action.type,
        appName,
        message,
        modeId: mode.id,
        modeName: mode.name,
        phase
      };
    });
  }

  private getActiveMode() {
    const { activeModeId, modes } = this.modeService.getModeState();

    if (activeModeId === null) {
      return null;
    }

    return modes.find((mode) => mode.id === activeModeId) ?? null;
  }

  private getModeById(modeId: string) {
    return this.modeService.getSavedModes().find((mode) => mode.id === modeId) ?? null;
  }
}
