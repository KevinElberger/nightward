import type { ModeAction, OpenAppModeAction, OpenUrlModeAction } from '@shared/modes';
import type { ApplicationRunningCheckInput } from '../applications/application-service';

export type ModeActionRunFailure = {
  action: ModeAction;
  message: string;
};

type ApplicationActionService = {
  isApplicationRunning: (input: ApplicationRunningCheckInput) => Promise<boolean>;
  openApplication: (appPath: string) => Promise<void>;
  openUrl: (url: string) => Promise<void>;
};

type ModeActionRunnerOptions = {
  applicationService: ApplicationActionService;
  getToday?: () => string;
  logger?: Pick<Console, 'warn'>;
};

export class ModeActionRunner {
  private readonly applicationService: ApplicationActionService;
  private readonly getToday: () => string;
  private readonly logger: Pick<Console, 'warn'>;
  private readonly runDatesByActionId = new Map<string, string>();

  constructor({
    applicationService,
    getToday = getLocalDateKey,
    logger = console
  }: ModeActionRunnerOptions) {
    this.applicationService = applicationService;
    this.getToday = getToday;
    this.logger = logger;
  }

  async runActions(actions: ModeAction[]) {
    const failures: ModeActionRunFailure[] = [];

    for (const action of actions) {
      const failure = await this.runAction(action);

      if (failure !== null) {
        failures.push(failure);
      }
    }

    return failures;
  }

  private async runAction(action: ModeAction) {
    if (!this.shouldAttemptAction(action)) {
      return null;
    }

    try {
      const didRunAction = await this.runEnabledAction(action);

      if (didRunAction) {
        this.recordActionRun(action);
      }
    } catch (error) {
      this.logger.warn('Failed to run mode action.', {
        actionId: action.id,
        error
      });

      return {
        action,
        message: getErrorMessage(error)
      };
    }

    return null;
  }

  private async runEnabledAction(action: ModeAction) {
    switch (action.type) {
      case 'open-app':
        return this.runOpenAppAction(action);

      case 'open-url':
        return this.runOpenUrlAction(action);
    }
  }

  private async runOpenAppAction(action: OpenAppModeAction) {
    if (action.onlyOpenIfNotRunning) {
      const isRunning = await this.applicationService.isApplicationRunning({
        appName: action.appName,
        appPath: action.appPath
      });

      if (isRunning) {
        return false;
      }
    }

    await this.applicationService.openApplication(action.appPath);

    return true;
  }

  private async runOpenUrlAction(action: OpenUrlModeAction) {
    await this.applicationService.openUrl(action.url);

    return true;
  }

  private shouldAttemptAction(action: ModeAction) {
    if (!action.enabled) {
      return false;
    }

    if (action.repeatPolicy !== 'once-per-day') {
      return true;
    }

    return this.runDatesByActionId.get(action.id) !== this.getToday();
  }

  private recordActionRun(action: ModeAction) {
    if (action.repeatPolicy === 'once-per-day') {
      this.runDatesByActionId.set(action.id, this.getToday());
    }
  }
}

function getLocalDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown action failure.';
