import {
  fetchZorgnedJZDAanvragen,
  fetchZorgnedJZDDocument,
  fetchZorgnedJZDDocuments,
  handleVoorzieningenRequest,
} from './wmo-route-handlers';
import {
  featureToggle,
  OAUTH_ROLE_WMO_VOORZIENINGEN,
  routes,
} from './wmo-service-config';
import { IS_TAP } from '../../../universal/config/env';
import { conditional } from '../../helpers/middleware';
import { OAuthVerificationHandler } from '../../routing/route-handlers';
import { createBFFRouter } from '../../routing/route-helpers';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler';

const wmoRouterPrivateNetwork = createBFFRouter({
  id: 'external-consumer-private-network-wmo',
  isEnabled: featureToggle.router.private.isEnabled,
});

wmoRouterPrivateNetwork.post(
  routes.private.WMO_VOORZIENINGEN,
  conditional(IS_TAP, OAuthVerificationHandler(OAUTH_ROLE_WMO_VOORZIENINGEN)),
  handleVoorzieningenRequest
);

const wmoRouterProtected = createBFFRouter({ id: 'protected-wmo' });

// WMO Zorgned Doc download
attachDocumentDownloadRoute(
  wmoRouterProtected,
  routes.protected.WMO_DOCUMENT_DOWNLOAD,
  fetchZorgnedJZDDocument
);

wmoRouterProtected.get(
  routes.protected.WMO_AANVRAGEN_RAW,
  fetchZorgnedJZDAanvragen
);
wmoRouterProtected.get(
  routes.protected.WMO_DOCUMENTS_LIST_RAW,
  fetchZorgnedJZDDocuments
);

export const wmoRouter = {
  private: wmoRouterPrivateNetwork,
  protected: wmoRouterProtected,
};

export const forTesting = {
  handleVoorzieningenRequest,
};
