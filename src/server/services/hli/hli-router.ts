import {
  fetchZorgnedAVAanvragen,
  fetchZorgnedAVDocument,
  handleBlockStadspas,
  handleFetchTransactionsRequest,
  handleUnblockStadspas,
} from './hli-route-handlers.ts';
import { featureToggle, routes } from './hli-service-config.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler.ts';

const hliRouterProtected = createBFFRouter({
  id: 'protected-hli',
  isEnabled: featureToggle.router.protected.isEnabled,
});

// HLI Stadspas transacties
hliRouterProtected.get(
  routes.protected.STADSPAS_TRANSACTIONS,
  handleFetchTransactionsRequest
);
hliRouterProtected.get(
  routes.protected.STADSPAS_BLOCK_PASS,
  handleBlockStadspas
);
hliRouterProtected.get(
  routes.protected.STADSPAS_UNBLOCK_PASS,
  handleUnblockStadspas
);

// HLI Regelingen / doc download
attachDocumentDownloadRoute(
  hliRouterProtected,
  routes.protected.HLI_DOCUMENT_DOWNLOAD,
  fetchZorgnedAVDocument
);

hliRouterProtected.get(
  routes.protected.HLI_AANVRAGEN_RAW,
  fetchZorgnedAVAanvragen
);

export const hliRouter = {
  protected: hliRouterProtected,
};

export const forTesting = {};
