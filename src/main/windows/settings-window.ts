import { BrowserWindow } from 'electron';
import path from 'node:path';
import { MODE_IPC_EVENTS } from '../../shared/mode-ipc';
import type { ModeState } from '../../shared/modes';

export type RendererConfig = {
  devServerUrl: string | undefined;
  name: string;
  preloadPath: string;
};

type SettingsWindowControllerOptions = {
  platform: NodeJS.Platform;
  renderer: RendererConfig;
};

const SETTINGS_WINDOW_BACKGROUND_COLOR = '#08080b';

export class SettingsWindowController {
  private readonly platform: NodeJS.Platform;
  private readonly renderer: RendererConfig;
  private isQuitting = false;
  private window: BrowserWindow | null = null;

  constructor({ platform, renderer }: SettingsWindowControllerOptions) {
    this.platform = platform;
    this.renderer = renderer;
  }

  create() {
    if (this.window !== null) {
      return this.window;
    }

    const window = new BrowserWindow({
      width: 960,
      height: 640,
      minWidth: 960,
      minHeight: 420,
      backgroundColor: SETTINGS_WINDOW_BACKGROUND_COLOR,
      show: false,
      title: 'Nightward Settings',
      ...(this.platform === 'darwin'
        ? {
            titleBarStyle: 'hidden' as const,
            trafficLightPosition: {
              x: 18,
              y: 20
            }
          }
        : {}),
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        preload: this.renderer.preloadPath
      }
    });

    window.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        window.hide();
      }
    });

    window.on('closed', () => {
      this.window = null;
    });

    this.loadRenderer(window);
    this.window = window;

    return window;
  }

  show() {
    const window = this.create();

    if (window.isMinimized()) {
      window.restore();
    }

    window.show();
    window.focus();
  }

  prepareForQuit() {
    this.isQuitting = true;
  }

  sendModeStateChanged(modeState: ModeState) {
    if (this.window === null || this.window.isDestroyed()) {
      return;
    }

    this.window.webContents.send(MODE_IPC_EVENTS.stateChanged, modeState);
  }

  private loadRenderer(window: BrowserWindow) {
    if (this.renderer.devServerUrl !== undefined) {
      void window.loadURL(this.renderer.devServerUrl);
      return;
    }

    void window.loadFile(path.join(__dirname, `../renderer/${this.renderer.name}/index.html`));
  }
}
