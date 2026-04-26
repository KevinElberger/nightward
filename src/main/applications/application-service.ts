import { dialog, type App, type OpenDialogOptions } from 'electron';
import { execFile } from 'node:child_process';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import type { GetApplicationIconResponse, SelectApplicationResponse } from '../../shared/mode-ipc';

const execFileAsync = promisify(execFile);

type ApplicationDialog = Pick<typeof dialog, 'showOpenDialog'>;
type ApplicationServiceApp = Pick<App, 'getFileIcon'>;

type ApplicationServiceOptions = {
  app: ApplicationServiceApp;
  applicationDialog?: ApplicationDialog;
  platform: NodeJS.Platform;
};

export class ApplicationService {
  private readonly app: ApplicationServiceApp;
  private readonly applicationDialog: ApplicationDialog;
  private readonly platform: NodeJS.Platform;

  constructor({ app, applicationDialog = dialog, platform }: ApplicationServiceOptions) {
    this.app = app;
    this.applicationDialog = applicationDialog;
    this.platform = platform;
  }

  readonly selectApplication = async (): Promise<SelectApplicationResponse> => {
    const options: OpenDialogOptions = {
      properties: ['openFile'],
      title: 'Choose Application'
    };

    if (this.platform === 'darwin') {
      options.defaultPath = '/Applications';
      options.filters = [{ name: 'Applications', extensions: ['app'] }];
    }

    const result = await this.applicationDialog.showOpenDialog(options);
    const appPath = result.filePaths[0];

    if (result.canceled || appPath === undefined) {
      return null;
    }

    const appDisplayName = await this.getMacApplicationDisplayName(appPath);

    return {
      appName: appDisplayName ?? path.basename(appPath, path.extname(appPath)),
      appPath,
      iconDataUrl: await this.getApplicationIcon(appPath)
    };
  };

  readonly getApplicationIcon = async (appPath: string): Promise<GetApplicationIconResponse> => {
    try {
      const bundleIconDataUrl = await this.getMacApplicationBundleIcon(appPath);

      if (bundleIconDataUrl !== null) {
        return bundleIconDataUrl;
      }

      const icon = await this.app.getFileIcon(appPath, { size: 'large' });

      if (icon.isEmpty()) {
        return null;
      }

      return icon.toDataURL();
    } catch {
      return null;
    }
  };

  private readonly getMacApplicationDisplayName = async (appPath: string) => {
    if (!this.isMacApplicationBundle(appPath)) {
      return null;
    }

    return (
      (await this.readMacApplicationPlistValue(appPath, 'CFBundleDisplayName')) ??
      (await this.readMacApplicationPlistValue(appPath, 'CFBundleName'))
    );
  };

  private readonly getMacApplicationBundleIcon = async (appPath: string) => {
    if (!this.isMacApplicationBundle(appPath)) {
      return null;
    }

    const iconFile = await this.readMacApplicationPlistValue(appPath, 'CFBundleIconFile');

    if (iconFile === null) {
      return null;
    }

    const iconFileName = path.extname(iconFile) === '' ? `${iconFile}.icns` : iconFile;
    const iconPath = path.join(appPath, 'Contents', 'Resources', iconFileName);

    try {
      await access(iconPath);
    } catch {
      return null;
    }

    const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'nightward-icon-'));
    const outputPath = path.join(temporaryDirectory, 'icon.png');

    try {
      await execFileAsync('/usr/bin/sips', [
        '-s',
        'format',
        'png',
        '--resampleHeightWidthMax',
        '64',
        iconPath,
        '--out',
        outputPath
      ]);
      const iconPng = await readFile(outputPath);

      return `data:image/png;base64,${iconPng.toString('base64')}`;
    } catch {
      return null;
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true }).catch(() => undefined);
    }
  };

  private readonly readMacApplicationPlistValue = async (appPath: string, key: string) => {
    const infoPlistPath = path.join(appPath, 'Contents', 'Info.plist');

    try {
      const { stdout } = await execFileAsync('/usr/bin/plutil', [
        '-extract',
        key,
        'raw',
        '-o',
        '-',
        infoPlistPath
      ]);
      const value = stdout.trim();

      return value === '' ? null : value;
    } catch {
      return null;
    }
  };

  private readonly isMacApplicationBundle = (appPath: string) =>
    this.platform === 'darwin' && appPath.toLowerCase().endsWith('.app');
}
