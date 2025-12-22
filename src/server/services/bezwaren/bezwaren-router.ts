import { fetchBezwaarDocument } from './bezwaren';
import { handleFetchBezwaarDetail } from './bezwaren-route-handlers';
import { featureToggle, routes } from './bezwaren-service-config';
import { createBFFRouter } from '../../routing/route-helpers';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler';

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
