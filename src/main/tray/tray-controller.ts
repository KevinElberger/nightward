import { Menu, nativeImage, Tray, type App, type MenuItemConstructorOptions } from 'electron';
import type { ModeAutomationService } from '../modes/mode-automation-service';
import type { ModeService } from '../modes/mode-service';
import { TRAY_ICON_DATA_URL } from './tray-icon';

const SAVED_MODE_MENU_LIMIT = 5;

type TrayControllerOptions = {
  app: App;
  modeAutomationService: Pick<ModeAutomationService, 'activateMode' | 'deactivateMode'>;
  modeService: ModeService;
  onModesChanged: () => void;
  onOpenSettings: () => void;
};

export class TrayController {
  private readonly app: App;
  private readonly modeAutomationService: Pick<
    ModeAutomationService,
    'activateMode' | 'deactivateMode'
  >;
  private readonly modeService: ModeService;
  private readonly onModesChanged: () => void;
  private readonly onOpenSettings: () => void;
  private tray: Tray | null = null;

  constructor({
    app,
    modeAutomationService,
    modeService,
    onModesChanged,
    onOpenSettings
  }: TrayControllerOptions) {
    this.app = app;
    this.modeService = modeService;
    this.modeAutomationService = modeAutomationService;
    this.onModesChanged = onModesChanged;
    this.onOpenSettings = onOpenSettings;
  }

  create() {
    if (this.tray !== null) {
      return this.tray;
    }

    const trayIcon = nativeImage.createFromDataURL(TRAY_ICON_DATA_URL);
    trayIcon.setTemplateImage(true);

    this.tray = new Tray(trayIcon);
    this.tray.setToolTip('Nightward');
    this.rebuildMenu();

    return this.tray;
  }

  refresh() {
    this.rebuildMenu();
  }

  private rebuildMenu() {
    this.tray?.setContextMenu(Menu.buildFromTemplate(this.getMenuTemplate()));
  }

  private getMenuTemplate(): MenuItemConstructorOptions[] {
    return [
      {
        label: this.modeService.getCurrentModeLabel(),
        enabled: false
      },
      ...this.getDeactivateModeMenuItems(),
      {
        type: 'separator'
      },
      ...this.getSavedModeMenuItems(),
      {
        type: 'separator'
      },
      {
        label: 'Open Settings',
        click: this.onOpenSettings
      },
      {
        label: 'Quit',
        click: () => {
          this.app.quit();
        }
      }
    ];
  }

  private getSavedModeMenuItems(): MenuItemConstructorOptions[] {
    return this.modeService.getSavedModes(SAVED_MODE_MENU_LIMIT).map((mode) => ({
      label: mode.name,
      click: async () => {
        const activated = await this.modeAutomationService.activateMode(mode.id);

        if (activated) {
          this.onModesChanged();
        }
      }
    }));
  }

  private getDeactivateModeMenuItems(): MenuItemConstructorOptions[] {
    if (this.modeService.getModeState().activeModeId === null) {
      return [];
    }

    return [
      {
        label: 'Deactivate Mode',
        click: async () => {
          const deactivated = await this.modeAutomationService.deactivateMode();

          if (deactivated) {
            this.onModesChanged();
          }
        }
      }
    ];
  }
}
