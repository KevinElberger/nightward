import { app } from 'electron';
import path from 'node:path';
import { AppController } from './app-controller';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

const appController = new AppController({
  app,
  platform: process.platform,
  renderer: {
    devServerUrl: MAIN_WINDOW_VITE_DEV_SERVER_URL,
    name: MAIN_WINDOW_VITE_NAME,
    preloadPath: path.join(__dirname, 'preload.js')
  }
});

appController.start();
