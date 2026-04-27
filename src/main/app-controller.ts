import { ipcMain, type App } from 'electron';
import { ApplicationService } from './applications/application-service';
import { registerModeIpcHandlers } from './ipc/mode-ipc-handlers';
import { ModeActionRunner } from './modes/mode-action-runner';
import { ModeAutomationService } from './modes/mode-automation-service';
import { ModeService } from './modes/mode-service';
import { createAppDataStore } from './persistence/app-data-store';
import { TrayController } from './tray/tray-controller';
import { SettingsWindowController, type RendererConfig } from './windows/settings-window';

type AppControllerOptions = {
  app: App;
  platform: NodeJS.Platform;
  renderer: RendererConfig;
};

export class AppController {
  private readonly applicationService: ApplicationService;
  private readonly app: App;
  private readonly platform: NodeJS.Platform;
  private readonly settingsWindow: SettingsWindowController;
  private modeAutomationService: ModeAutomationService | null = null;
  private modeService: ModeService | null = null;
  private tray: TrayController | null = null;

  constructor({ app, platform, renderer }: AppControllerOptions) {
    this.app = app;
    this.applicationService = new ApplicationService({ app, platform });
    this.platform = platform;
    this.settingsWindow = new SettingsWindowController({
      platform,
      renderer
    });
  }

  start() {
    void this.app.whenReady().then(async () => {
      this.modeService = new ModeService(createAppDataStore(this.app));
      await this.modeService.initialize();
      this.modeAutomationService = new ModeAutomationService({
        actionRunner: new ModeActionRunner({
          applicationService: this.applicationService
        }),
        modeService: this.modeService
      });

      this.tray = new TrayController({
        app: this.app,
        modeAutomationService: this.modeAutomationService,
        modeService: this.modeService,
        onModesChanged: this.handleModesChanged,
        onOpenSettings: () => {
          this.settingsWindow.show();
        }
      });

      registerModeIpcHandlers({
        getApplicationIcon: this.applicationService.getApplicationIcon,
        ipcMain,
        modeAutomationService: this.modeAutomationService,
        modeService: this.modeService,
        onModesChanged: this.handleModesChanged,
        selectApplication: this.applicationService.selectApplication
      });

      this.settingsWindow.create();
      this.tray.create();

      this.app.on('activate', () => {
        this.settingsWindow.show();
      });
    });

    this.app.on('before-quit', () => {
      this.settingsWindow.prepareForQuit();
    });

    this.app.on('window-all-closed', () => {
      if (this.platform !== 'darwin') {
        this.app.quit();
      }
    });
  }

  private readonly handleModesChanged = () => {
    if (this.modeService === null) {
      return;
    }

    this.tray?.refresh();
    this.settingsWindow.sendModeStateChanged(this.modeService.getModeState());
  };
}
