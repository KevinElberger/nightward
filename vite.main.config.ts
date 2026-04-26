import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['electron']
    }
  },
  resolve: {
    alias: {
      '@shared': path.resolve(dirname, 'src/shared')
    }
  }
});
