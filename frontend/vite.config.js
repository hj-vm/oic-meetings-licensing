import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5173, // Default Vite port
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        // Add other pages here as needed
        // meetings: resolve(__dirname, 'src/meetings.html'),
        // papers: resolve(__dirname, 'src/papers.html'),
        // licensing: resolve(__dirname, 'src/licensing.html'),
      }
    }
  }
});
