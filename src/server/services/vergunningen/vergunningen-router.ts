import { routes } from './vergunningen-service-config.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';
import { createHandleFetchDecosDocumentsList } from '../decos/decos-route-handlers.ts';
import { fetchDecosDocument } from '../decos/decos-service.ts';
import { fetchDocument as fetchPowerBrowserDocument } from '../powerbrowser/powerbrowser-service.ts';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler.ts';

const vergunningenRouterProtected = createBFFRouter({
  id: 'protected-vergunningen-router',
});

vergunningenRouterProtected.get(
  routes.protected.VERGUNNINGEN_DECOS_DOCUMENTS_LIST,
  createHandleFetchDecosDocumentsList(
    routes.protected.VERGUNNINGEN_DECOS_DOCUMENT_DOWNLOAD
  )
);

attachDocumentDownloadRoute(
  vergunningenRouterProtected,
  routes.protected.VERGUNNINGEN_DECOS_DOCUMENT_DOWNLOAD,
  fetchDecosDocument
);

attachDocumentDownloadRoute(
  vergunningenRouterProtected,
  routes.protected.VERGUNNINGEN_PB_DOCUMENT_DOWNLOAD,
  fetchPowerBrowserDocument
);

export const vergunningenRouter = {
  protected: vergunningenRouterProtected,
};
