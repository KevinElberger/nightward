import { describe, expect, it, vi } from 'vitest';
import { buildOpenAppModeAction } from '@test/builders/shared/modes';
import { ModeActionRunner } from './mode-action-runner';

const createRunner = ({
  isApplicationRunning = false,
  today = '2026-04-27'
}: {
  isApplicationRunning?: boolean;
  today?: string;
} = {}) => {
  const applicationService = {
    isApplicationRunning: vi.fn().mockResolvedValue(isApplicationRunning),
    openApplication: vi.fn().mockResolvedValue(undefined)
  };
  const logger = {
    warn: vi.fn()
  };
  const runner = new ModeActionRunner({
    applicationService,
    getToday: () => today,
    logger
  });

  return { applicationService, logger, runner };
};

describe('ModeActionRunner', () => {
  it('opens enabled open-app actions', async () => {
    const { applicationService, runner } = createRunner();

    await runner.runActions([buildOpenAppModeAction()]);

    expect(applicationService.openApplication).toHaveBeenCalledWith('/Applications/Calendar.app');
  });

  it('skips disabled actions', async () => {
    const { applicationService, runner } = createRunner();

    await runner.runActions([buildOpenAppModeAction({ enabled: false })]);

    expect(applicationService.openApplication).not.toHaveBeenCalled();
  });

  it('skips opening an app that is already running when configured to do so', async () => {
    const { applicationService, runner } = createRunner({ isApplicationRunning: true });

    await runner.runActions([buildOpenAppModeAction({ onlyOpenIfNotRunning: true })]);

    expect(applicationService.isApplicationRunning).toHaveBeenCalledWith({
      appName: 'Calendar',
      appPath: '/Applications/Calendar.app'
    });
    expect(applicationService.openApplication).not.toHaveBeenCalled();
  });

  it('runs once-per-day actions once per local day', async () => {
    let today = '2026-04-27';
    const applicationService = {
      isApplicationRunning: vi.fn().mockResolvedValue(false),
      openApplication: vi.fn().mockResolvedValue(undefined)
    };
    const runner = new ModeActionRunner({
      applicationService,
      getToday: () => today,
      logger: { warn: vi.fn() }
    });
    const action = buildOpenAppModeAction({ repeatPolicy: 'once-per-day' });

    await runner.runActions([action]);
    await runner.runActions([action]);
    today = '2026-04-28';
    await runner.runActions([action]);

    expect(applicationService.openApplication).toHaveBeenCalledTimes(2);
  });

  it('uses the device-local date for once-per-day actions by default', async () => {
    vi.useFakeTimers();

    try {
      vi.setSystemTime(new Date(2026, 0, 5, 23, 30));

      const applicationService = {
        isApplicationRunning: vi.fn().mockResolvedValue(false),
        openApplication: vi.fn().mockResolvedValue(undefined)
      };
      const runner = new ModeActionRunner({
        applicationService,
        logger: { warn: vi.fn() }
      });
      const action = buildOpenAppModeAction({ repeatPolicy: 'once-per-day' });

      await runner.runActions([action]);
      await runner.runActions([action]);
      vi.setSystemTime(new Date(2026, 0, 6, 0, 5));
      await runner.runActions([action]);

      expect(applicationService.openApplication).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('continues when opening an app fails', async () => {
    const { applicationService, logger, runner } = createRunner();
    applicationService.openApplication
      .mockRejectedValueOnce(new Error('Could not open app'))
      .mockResolvedValueOnce(undefined);

    const failures = await runner.runActions([
      buildOpenAppModeAction({ id: 'action-1' }),
      buildOpenAppModeAction({ id: 'action-2' })
    ]);

    expect(applicationService.openApplication).toHaveBeenCalledTimes(2);
    expect(failures).toEqual([
      {
        action: expect.objectContaining({ id: 'action-1' }),
        message: 'Could not open app'
      }
    ]);
    expect(logger.warn).toHaveBeenCalledWith('Failed to run mode action.', {
      actionId: 'action-1',
      error: expect.any(Error)
    });
  });
});
