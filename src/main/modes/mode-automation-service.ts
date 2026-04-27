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

  readonly activateMode = async (modeId: string) => {
    const previousActiveMode = this.getActiveMode();
    const activated = await this.modeService.activateSavedMode(modeId);

    if (!activated) {
      return false;
    }

    const activatedMode = this.getModeById(modeId);

    if (previousActiveMode?.id === activatedMode?.id) {
      return true;
    }

    await this.runModePhase(previousActiveMode, 'exit');
    await this.runModePhase(activatedMode, 'enter');

    return true;
  };

  readonly deactivateMode = async () => {
    const previousActiveMode = this.getActiveMode();
    const deactivated = await this.modeService.deactivateActiveMode();

    if (!deactivated) {
      return false;
    }

    await this.runModePhase(previousActiveMode, 'exit');

    return true;
  };

  private async runModePhase(mode: SavedMode | null, phase: ModeActionPhase) {
    if (mode === null) {
      return;
    }

    await this.actionRunner.runActions(mode.actions[phase]);
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
