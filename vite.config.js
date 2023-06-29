import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { createHash } from 'node:crypto';

export default defineConfig(() => {
  return {
    server: {
      port: process.env.port ?? 3000,
    },
    // https://github.com/vitejs/vite/issues/1973#issuecomment-787571499
    define: {
      'process.env': {},
    },
    envPrefix: 'REACT_APP_',
    build: {
      outDir: 'build',
    },
    plugins: [
      react(),
      // svgr options: https://react-svgr.com/docs/options/
      svgr(),
    ],
    css: {
      modules: {
        scopeBehaviour: 'local',
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
  };
});
