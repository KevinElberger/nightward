import { BrowserWindow } from 'electron';
import path from 'node:path';

export type RendererConfig = {
  devServerUrl: string | undefined;
  name: string;
  preloadPath: string;
};

export class SettingsWindowController {
  private readonly renderer: RendererConfig;
  private isQuitting = false;
  private window: BrowserWindow | null = null;

  constructor(renderer: RendererConfig) {
    this.renderer = renderer;
  }

  create() {
    if (this.window !== null) {
      return this.window;
    }

    const window = new BrowserWindow({
      width: 960,
      height: 640,
      minWidth: 640,
      minHeight: 420,
      show: false,
      title: 'Nightward Settings',
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

  private loadRenderer(window: BrowserWindow) {
    if (this.renderer.devServerUrl !== undefined) {
      void window.loadURL(this.renderer.devServerUrl);
      return;
    }

    void window.loadFile(path.join(__dirname, `../renderer/${this.renderer.name}/index.html`));
  }
}
