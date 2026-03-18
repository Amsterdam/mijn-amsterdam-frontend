import { handleFetchBezwaarDetail } from './bezwaren-route-handlers.ts';
import { featureToggle, routes } from './bezwaren-service-config.ts';
import { fetchBezwaarDocument } from './bezwaren.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler.ts';

const bezwarenRouterProtected = createBFFRouter({
  id: 'protected-bezwaren-router',
  isEnabled: featureToggle.router.protected.isEnabled,
});

bezwarenRouterProtected.get(
  routes.protected.BEZWAREN_DETAIL,
  handleFetchBezwaarDetail
);

attachDocumentDownloadRoute(
  bezwarenRouterProtected,
  routes.protected.BEZWAREN_DOCUMENT_DOWNLOAD,
  fetchBezwaarDocument
);

export const bezwarenRouter = {
  protected: bezwarenRouterProtected,
};
