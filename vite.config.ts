import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Build produces one self-contained dist/index.html (opens without a server).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
});
