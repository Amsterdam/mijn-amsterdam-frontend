/// <reference types="vitest" />
/* eslint-disable */
import { createHash } from 'node:crypto';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  server: {
    port: process.env.port ? parseInt(process.env.port, 10) : 3000,
  },
  // https://github.com/vitejs/vite/issues/1973#issuecomment-787571499
  // Using the define option over import.meta because the Node part our universal app cannot handle import.meta yet.
  // See also src/mijnamsterdam.d.ts
  define: {
    MA_OTAP_ENV: JSON.stringify(process.env.MA_OTAP_ENV || 'development'),
    MA_APP_MODE: JSON.stringify(process.env.MA_APP_MODE || 'production'),
    MA_APP_VERSION: JSON.stringify(
      process.env.MA_RELEASE_VERSION_TAG || 'notset'
    ),
    MA_BUILD_ID: JSON.stringify(process.env.MA_BUILD_ID || '-1'),
    MA_GIT_SHA: JSON.stringify(process.env.MA_GIT_SHA || '-1'),
  },
  envPrefix: 'REACT_APP_',
  build: {
    outDir: 'build',
    sourcemap: true,
    target: 'es2015',
  },

  test: {
    globals: true,
    environment: 'happy-dom', // NOTE: overridden with 'node' when testing bff application
    environmentOptions: {
      happyDOM: {
        settings: {
          fetch: {
            disableSameOriginPolicy: true, // Allows cross-origin requests in tests
          },
        },
      },
    },
    setupFiles: './src/testing/setup.ts',
    css: false,
  },
  plugins: [
    react(),
    // insert eslint plugin when errors are dealt with
    // eslint({
    //   overrideConfigFile: path.resolve(__dirname, 'eslint.config.mjs'),
    // }),
    // svgr options: https://react-svgr.com/docs/options/
    svgr(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "/src/client/styles/_global.scss" as *;',
        silenceDeprecations: ['import', 'legacy-js-api'],
      },
    },
    modules: {
      scopeBehaviour: 'local',
      // Generate correct CSS name that matches the Create React App one. Some Styles depend on these generated class names.
      generateScopedName: function (name, filename) {
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
/* eslint-enable */
