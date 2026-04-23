import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src/renderer'),
      '@shared': path.resolve(dirname, 'src/shared'),
      '@test': path.resolve(dirname, 'src/test')
    }
  }
});
