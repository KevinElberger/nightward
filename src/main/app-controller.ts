import { ipcMain, type App } from 'electron';
import { registerModeIpcHandlers } from './ipc/mode-ipc-handlers';
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
  private readonly app: App;
  private readonly platform: NodeJS.Platform;
  private readonly settingsWindow: SettingsWindowController;
  private modeService: ModeService | null = null;
  private tray: TrayController | null = null;

  constructor({ app, platform, renderer }: AppControllerOptions) {
    this.app = app;
    this.platform = platform;
    this.settingsWindow = new SettingsWindowController(renderer);
  }

  start() {
    void this.app.whenReady().then(async () => {
      this.modeService = new ModeService(createAppDataStore(this.app));
      await this.modeService.initialize();

      this.tray = new TrayController({
        app: this.app,
        modeService: this.modeService,
        onOpenSettings: () => {
          this.settingsWindow.show();
        }
      });

      registerModeIpcHandlers({
        ipcMain,
        modeService: this.modeService,
        onModesChanged: () => {
          this.tray?.refresh();
        }
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
}
