// Load environment variables first since code afterwards relies on them being available.
import './helpers/load-env.ts';
import { startAppConfiguration } from './config/azure-appconfiguration.ts';
import { startBlobStorage } from './config/azure-storage.ts';

(async function startApp() {
  // Updates/starts appconfiguration and featuretoggles, this should happen before server start so that -
  // it is ensured the right data is send on first and subsequent requests.
  await startAppConfiguration();
  await startBlobStorage();
  import('./app.ts');
})();
