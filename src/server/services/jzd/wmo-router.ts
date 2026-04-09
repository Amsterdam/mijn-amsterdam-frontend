import {
  fetchZorgnedJZDAanvragen,
  fetchZorgnedJZDDocument,
  fetchZorgnedJZDDocuments,
  handleVoorzieningDetailRequest,
  handleVoorzieningenRequest,
} from './wmo-route-handlers.ts';
import {
  featureToggle,
  OAUTH_ROLE_JZD_VOORZIENINGEN,
  routes,
} from './wmo-service-config.ts';
import { IS_TAP } from '../../../universal/config/env.ts';
import { conditional } from '../../helpers/middleware.ts';
import { OAuthVerificationHandler } from '../../routing/route-handlers.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler.ts';
import { fetchZorgnedLLVDocument } from './jeugd/route-handlers.ts';

const jzdRouterPrivateNetwork = createBFFRouter({
  id: 'external-consumer-private-network-jzd',
  isEnabled: featureToggle.router.private.isEnabled,
});

const jzdOauthMiddleware = OAuthVerificationHandler(
  OAUTH_ROLE_JZD_VOORZIENINGEN
);
jzdRouterPrivateNetwork.post(
  routes.private.JZD_VOORZIENINGEN,
  conditional(IS_TAP, jzdOauthMiddleware),
  handleVoorzieningenRequest
);
jzdRouterPrivateNetwork.post(
  routes.private.JZD_VOORZIENING_DETAIL,
  conditional(IS_TAP, jzdOauthMiddleware),
  handleVoorzieningDetailRequest
);

const jzdRouterProtected = createBFFRouter({ id: 'protected-jzd' });
// JEUGD/LLV
// LLV Zorgned Doc download
attachDocumentDownloadRoute(
  jzdRouterProtected,
  routes.protected.LLV_DOCUMENT_DOWNLOAD,
  fetchZorgnedLLVDocument
);

// WMO Zorgned Doc download
attachDocumentDownloadRoute(
  jzdRouterProtected,
  routes.protected.WMO_DOCUMENT_DOWNLOAD,
  fetchZorgnedJZDDocument
);

jzdRouterProtected.get(
  routes.protected.WMO_AANVRAGEN_RAW,
  fetchZorgnedJZDAanvragen
);
jzdRouterProtected.get(
  routes.protected.WMO_DOCUMENTS_LIST_RAW,
  fetchZorgnedJZDDocuments
);

export const jzdRouter = {
  private: jzdRouterPrivateNetwork,
  protected: jzdRouterProtected,
};
