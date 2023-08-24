/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { createHash } from 'node:crypto';

export default defineConfig({
  server: {
    port: process.env.port ? parseInt(process.env.port, 10) : 3000,
  },
  // https://github.com/vitejs/vite/issues/1973#issuecomment-787571499
  define: {
    'process.env': {},
  },
  envPrefix: 'REACT_APP_',
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  plugins: [
    react(),
    // svgr options: https://react-svgr.com/docs/options/
    svgr(),
  ],
  test: {
    globals: true,
    environment: 'jsdom', // NOTE: overridden with 'node' when testing bff application
    setupFiles: './src/setupTests.ts',
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: false,
  },
  css: {
    modules: {
      scopeBehaviour: 'local',
      // Generate correct CSS name that matches the Create React App one. Some Styles depend on these generated class names.
      generateScopedName: function (name, filename, css) {
        const path = require('path');
        let file = path.basename(filename);
        file = file.split('.')[0];
        const hashFunc = createHash('md5');
        hashFunc.update(filename);
        const hash = btoa(hashFunc.digest('hex')).substring(0, 5);
        return file + '_' + name + '__' + hash;
      },
    },
  },
});
