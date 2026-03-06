// Keep the loading of environment variables at the top.
import './helpers/load-env';
import { startAppConfiguration } from './config/azure-appconfiguration';

(async function startApp() {
  // Updates/starts appconfiguration and featuretoggles, this should happen before server start so that -
  // it is ensured the right data is send on first and subsequent requests.
  await startAppConfiguration();
  import('./app');
})();
