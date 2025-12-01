import { fetchBezwaarDocument } from './bezwaren';
import {
  handleFetchBezwaarDetail,
  handleFetchBezwaarDetailRaw,
  handleFetchBezwarenRaw,
} from './bezwaren-route-handlers';
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

bezwarenRouterProtected.get(
  routes.protected.BEZWAREN_RAW,
  handleFetchBezwarenRaw
);

bezwarenRouterProtected.get(
  routes.protected.BEZWAREN_DETAIL_RAW,
  handleFetchBezwaarDetailRaw
);

export const bezwarenRouter = {
  protected: bezwarenRouterProtected,
};
