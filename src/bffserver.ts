// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./mijnamsterdam.d.ts" />
import '../src/server/helpers/load-env';
import { startAppConfiguration } from './server/config/azure-appconfiguration';

(async function () {
  await startAppConfiguration();
  // Compilation entrypoint
  import('./server/app');
})();
