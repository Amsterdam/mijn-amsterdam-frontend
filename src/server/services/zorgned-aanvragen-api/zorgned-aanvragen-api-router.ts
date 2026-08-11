import {
  handleAanvraagDetailRequest,
  handleAanvragenRequest,
} from './zorgned-aanvragen-api-route-handlers.ts';
import {
  featureToggle,
  OAUTH_ROLE_ZORGNED_AANVRAGEN,
  routes,
} from './zorgned-aanvragen-api-service-config.ts';
import { IS_TAP } from '../../../universal/config/env.ts';
import { conditional } from '../../helpers/middleware.ts';
import { OAuthVerificationHandler } from '../../routing/route-handlers.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';

const zorgnedAanvragenApiRouterPrivateNetwork = createBFFRouter({
  id: 'external-consumer-private-network-zorgned-aanvragen',
  isEnabled: featureToggle.router.private.isEnabled,
});

const zorgnedAanvragenOauthMiddleware = OAuthVerificationHandler(
  OAUTH_ROLE_ZORGNED_AANVRAGEN
);

zorgnedAanvragenApiRouterPrivateNetwork.post(
  [routes.private.AANVRAGEN, routes.private.VOORZIENINGEN_JZD],
  conditional(IS_TAP, zorgnedAanvragenOauthMiddleware),
  handleAanvragenRequest
);

zorgnedAanvragenApiRouterPrivateNetwork.post(
  routes.private.AANVRAAG_DETAIL,
  conditional(IS_TAP, zorgnedAanvragenOauthMiddleware),
  handleAanvraagDetailRequest
);

export const zorgnedAanvragenApiRouter = {
  private: zorgnedAanvragenApiRouterPrivateNetwork,
};
