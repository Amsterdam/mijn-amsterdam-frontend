import {
  fetchZorgnedAanvragenWMO,
  fetchZorgnedDocumentWMO,
  fetchZorgnedDocumentsWMO,
  handleVoorzieningDetailRequest,
  handleVoorzieningenRequest,
} from './jzd-route-handlers.ts';
import {
  featureToggle,
  OAUTH_ROLE_JZD_VOORZIENINGEN,
  routes,
} from './jzd-service-config.ts';
import { IS_TAP } from '../../../universal/config/env.ts';
import { conditional } from '../../helpers/middleware.ts';
import { OAuthVerificationHandler } from '../../routing/route-handlers.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler.ts';
import { fetchZorgnedDocumentLLV } from './jeugd/route-handlers.ts';

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

// LLV Zorgned Doc download
attachDocumentDownloadRoute(
  jzdRouterProtected,
  routes.protected.LLV_DOCUMENT_DOWNLOAD,
  fetchZorgnedDocumentLLV
);

// WMO Zorgned Doc download
attachDocumentDownloadRoute(
  jzdRouterProtected,
  routes.protected.WMO_DOCUMENT_DOWNLOAD,
  fetchZorgnedDocumentWMO
);

jzdRouterProtected.get(
  routes.protected.WMO_AANVRAGEN_RAW,
  fetchZorgnedAanvragenWMO
);
jzdRouterProtected.get(
  routes.protected.WMO_DOCUMENTS_LIST_RAW,
  fetchZorgnedDocumentsWMO
);

export const jzdRouter = {
  private: jzdRouterPrivateNetwork,
  protected: jzdRouterProtected,
};
