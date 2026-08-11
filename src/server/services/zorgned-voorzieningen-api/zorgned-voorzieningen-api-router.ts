import {
  handleVoorzieningDetailRequest,
  handleVoorzieningenRequest,
} from './zorgned-voorzieningen-api-route-handlers.ts';
import {
  featureToggle,
  OAUTH_ROLE_ZORGNED_VOORZIENINGEN,
  routes,
} from './zorgned-voorzieningen-api-service-config.ts';
import { IS_TAP } from '../../../universal/config/env.ts';
import { conditional } from '../../helpers/middleware.ts';
import { OAuthVerificationHandler } from '../../routing/route-handlers.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';

const zorgnedVoorzieningenApiRouterPrivateNetwork = createBFFRouter({
  id: 'external-consumer-private-network-zorgned-voorzieningen',
  isEnabled: featureToggle.router.private.isEnabled,
});

const zorgnedVoorzieningenOauthMiddleware = OAuthVerificationHandler(
  OAUTH_ROLE_ZORGNED_VOORZIENINGEN
);

zorgnedVoorzieningenApiRouterPrivateNetwork.post(
  routes.private.VOORZIENINGEN,
  conditional(IS_TAP, zorgnedVoorzieningenOauthMiddleware),
  handleVoorzieningenRequest
);

zorgnedVoorzieningenApiRouterPrivateNetwork.post(
  routes.private.VOORZIENING_DETAIL,
  conditional(IS_TAP, zorgnedVoorzieningenOauthMiddleware),
  handleVoorzieningDetailRequest
);

export const zorgnedVoorzieningenApiRouter = {
  private: zorgnedVoorzieningenApiRouterPrivateNetwork,
};
