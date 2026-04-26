import type { App } from 'electron';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildSavedMode } from '@test/builders/shared/modes';
import type { ModeService } from '../modes/mode-service';

const electronMock = vi.hoisted(() => {
  const setContextMenu = vi.fn();
  const setTemplateImage = vi.fn();
  const setToolTip = vi.fn();

  return {
    buildFromTemplate: vi.fn((template) => template),
    createFromDataURL: vi.fn(() => ({
      setTemplateImage
    })),
    setContextMenu,
    setTemplateImage,
    setToolTip,
    Tray: vi.fn(function MockTray() {
      return {
        setContextMenu,
        setToolTip
      };
    })
  };
});

vi.mock('electron', () => ({
  Menu: {
    buildFromTemplate: electronMock.buildFromTemplate
  },
  nativeImage: {
    createFromDataURL: electronMock.createFromDataURL
  },
  Tray: electronMock.Tray
}));

const { TrayController } = await import('./tray-controller');

type TrayMenuItem = {
  click?: () => Promise<void> | void;
  label?: string;
  type?: string;
};

const modes = [buildSavedMode()];

const createModeService = ({
  activeModeId = null,
  activateSavedMode = vi.fn().mockResolvedValue(true),
  deactivateActiveMode = vi.fn().mockResolvedValue(true)
}: {
  activeModeId?: string | null;
  activateSavedMode?: (modeId: string) => Promise<boolean>;
  deactivateActiveMode?: () => Promise<boolean>;
} = {}) =>
  ({
    activateSavedMode,
    deactivateActiveMode,
    getCurrentModeLabel: vi.fn(() => (activeModeId === null ? 'No Active Mode' : 'Focus')),
    getModeState: vi.fn(() => ({
      activeModeId,
      modes
    })),
    getSavedModes: vi.fn(() => modes)
  }) as unknown as ModeService;

const createTrayController = ({
  modeService = createModeService(),
  onModesChanged = vi.fn()
}: {
  modeService?: ModeService;
  onModesChanged?: () => void;
} = {}) => {
  const app = {
    quit: vi.fn()
  } as unknown as App;

  const trayController = new TrayController({
    app,
    modeService,
    onModesChanged,
    onOpenSettings: vi.fn()
  });

  trayController.create();

  return { modeService, onModesChanged };
};

const getMenuItem = (label: string) => {
  const template = electronMock.buildFromTemplate.mock.calls.at(-1)?.[0] as
    | TrayMenuItem[]
    | undefined;
  const menuItem = template?.find((item) => item.label === label);

  if (menuItem === undefined) {
    throw new Error(`Unable to find tray menu item "${label}".`);
  }

  return menuItem;
};

describe('TrayController', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('notifies when a mode is activated from the tray', async () => {
    const activateSavedMode = vi.fn().mockResolvedValue(true);
    const modeService = createModeService({ activateSavedMode });
    const onModesChanged = vi.fn();
    createTrayController({ modeService, onModesChanged });

    await getMenuItem('Focus').click?.();

    expect(activateSavedMode).toHaveBeenCalledWith('mode-1');
    expect(onModesChanged).toHaveBeenCalledOnce();
  });

  it('notifies when the active mode is deactivated from the tray', async () => {
    const deactivateActiveMode = vi.fn().mockResolvedValue(true);
    const modeService = createModeService({ activeModeId: 'mode-1', deactivateActiveMode });
    const onModesChanged = vi.fn();
    createTrayController({ modeService, onModesChanged });

    await getMenuItem('Deactivate Mode').click?.();

    expect(deactivateActiveMode).toHaveBeenCalledOnce();
    expect(onModesChanged).toHaveBeenCalledOnce();
  });

  it('does not notify when a tray activation does not change mode state', async () => {
    const activateSavedMode = vi.fn().mockResolvedValue(false);
    const modeService = createModeService({ activateSavedMode });
    const onModesChanged = vi.fn();
    createTrayController({ modeService, onModesChanged });

    await getMenuItem('Focus').click?.();

    expect(onModesChanged).not.toHaveBeenCalled();
  });
});
