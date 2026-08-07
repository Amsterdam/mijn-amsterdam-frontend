import { routes } from './horeca-service-config.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';
import { createHandleFetchDecosDocumentsList } from '../decos/decos-route-handlers.ts';
import { fetchDecosDocument } from '../decos/decos-service.ts';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler.ts';

const horecaRouterProtected = createBFFRouter({
  id: 'protected-horeca-router',
});

horecaRouterProtected.get(
  routes.protected.HORECA_DOCUMENTS_LIST,
  createHandleFetchDecosDocumentsList(routes.protected.HORECA_DOCUMENT_DOWNLOAD)
);

attachDocumentDownloadRoute(
  horecaRouterProtected,
  routes.protected.HORECA_DOCUMENT_DOWNLOAD,
  fetchDecosDocument
);

export const horecaRouter = {
  protected: horecaRouterProtected,
};
