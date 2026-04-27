import type { App, NativeImage } from 'electron';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationService } from './application-service';

const buildFileIcon = ({
  dataUrl = 'data:image/png;base64,abc',
  isEmpty = false
}: {
  dataUrl?: string;
  isEmpty?: boolean;
} = {}) =>
  ({
    isEmpty: () => isEmpty,
    toDataURL: () => dataUrl
  }) as NativeImage;

const buildApp = (icon = buildFileIcon()) =>
  ({
    getFileIcon: vi.fn().mockResolvedValue(icon)
  }) as unknown as Pick<App, 'getFileIcon'>;

const buildApplicationDialog = (result: { canceled: boolean; filePaths: string[] }) => ({
  showOpenDialog: vi.fn().mockResolvedValue(result)
});

describe('ApplicationService', () => {
  it('selects an application and hydrates its icon', async () => {
    const app = buildApp();
    const applicationDialog = buildApplicationDialog({
      canceled: false,
      filePaths: ['/Applications/Spotify.app']
    });
    const service = new ApplicationService({
      app,
      applicationDialog,
      platform: 'linux'
    });

    await expect(service.selectApplication()).resolves.toEqual({
      appName: 'Spotify',
      appPath: '/Applications/Spotify.app',
      iconDataUrl: 'data:image/png;base64,abc'
    });
    expect(applicationDialog.showOpenDialog).toHaveBeenCalledWith({
      properties: ['openFile'],
      title: 'Choose Application'
    });
    expect(app.getFileIcon).toHaveBeenCalledWith('/Applications/Spotify.app', { size: 'large' });
  });

  it('uses macOS application picker options on Darwin', async () => {
    const app = buildApp();
    const applicationDialog = buildApplicationDialog({
      canceled: true,
      filePaths: []
    });
    const service = new ApplicationService({
      app,
      applicationDialog,
      platform: 'darwin'
    });

    await expect(service.selectApplication()).resolves.toBeNull();
    expect(applicationDialog.showOpenDialog).toHaveBeenCalledWith({
      defaultPath: '/Applications',
      filters: [{ name: 'Applications', extensions: ['app'] }],
      properties: ['openFile'],
      title: 'Choose Application'
    });
    expect(app.getFileIcon).not.toHaveBeenCalled();
  });

  it('returns null when the selected file has no usable icon', async () => {
    const app = buildApp(buildFileIcon({ isEmpty: true }));
    const service = new ApplicationService({
      app,
      platform: 'linux'
    });

    await expect(service.getApplicationIcon('/Applications/Spotify.app')).resolves.toBeNull();
  });

  it('returns null when icon hydration fails', async () => {
    const app = {
      getFileIcon: vi.fn().mockRejectedValue(new Error('No icon'))
    } as unknown as Pick<App, 'getFileIcon'>;
    const service = new ApplicationService({
      app,
      platform: 'linux'
    });

    await expect(service.getApplicationIcon('/Applications/Spotify.app')).resolves.toBeNull();
  });

  it('opens an application path', async () => {
    const applicationShell = {
      openPath: vi.fn().mockResolvedValue('')
    };
    const service = new ApplicationService({
      app: buildApp(),
      applicationShell,
      platform: 'darwin'
    });

    await expect(service.openApplication('/Applications/Spotify.app')).resolves.toBeUndefined();

    expect(applicationShell.openPath).toHaveBeenCalledWith('/Applications/Spotify.app');
  });

  it('rejects when opening an application fails', async () => {
    const service = new ApplicationService({
      app: buildApp(),
      applicationShell: {
        openPath: vi.fn().mockResolvedValue('Could not open app.')
      },
      platform: 'darwin'
    });

    await expect(service.openApplication('/Applications/Spotify.app')).rejects.toThrow(
      'Could not open app.'
    );
  });
});
