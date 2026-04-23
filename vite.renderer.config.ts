import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  const { default: tailwindcss } = await import('@tailwindcss/vite');

  return {
    root: 'src/renderer',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(dirname, 'src/renderer'),
        '@shared': path.resolve(dirname, 'src/shared')
      }
    }
  };
});
