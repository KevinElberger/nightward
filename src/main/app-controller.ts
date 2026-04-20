import type { App } from 'electron';
import { ModeService } from './modes/mode-service';
import { PlaceholderModeRepository } from './modes/placeholder-mode-repository';
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
  private readonly modeService = new ModeService(new PlaceholderModeRepository());
  private readonly settingsWindow: SettingsWindowController;
  private readonly tray: TrayController;

  constructor({ app, platform, renderer }: AppControllerOptions) {
    this.app = app;
    this.platform = platform;
    this.settingsWindow = new SettingsWindowController(renderer);
    this.tray = new TrayController({
      app,
      modeService: this.modeService,
      onOpenSettings: () => {
        this.settingsWindow.show();
      }
    });
  }

  start() {
    void this.app.whenReady().then(() => {
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
