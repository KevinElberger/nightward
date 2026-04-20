import type { NightwardApi } from '../shared/nightward-api';

declare global {
  interface Window {
    nightward: NightwardApi;
  }
}

// Keep this declaration file in module scope so global augmentation stays explicit.
export {};
