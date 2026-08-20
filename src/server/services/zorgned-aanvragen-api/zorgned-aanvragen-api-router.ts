import {
  handleAanvraagDetailRequest,
  handleAanvragenRequest,
} from './zorgned-aanvragen-api-route-handlers.ts';
import {
  featureToggle,
  OAUTH_ROLE_ZORGNED_AANVRAGEN,
  routes,
} from './zorgned-aanvragen-api-service-config.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { conditional } from '../../helpers/middleware.ts';
import { OAuthVerificationHandler } from '../../routing/route-handlers.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';

// Enabled by default, but can be disabled by setting the environment variable to false.
const IS_OAUTH_VERIFICATION_ENABLED =
  getFromEnv('BFF_IS_VOORZIENINGEN_API_OAUTH_ENABLED', false) !== 'false';

const zorgnedAanvragenApiRouterPrivateNetwork = createBFFRouter({
  id: 'external-consumer-private-network-zorgned-aanvragen',
  isEnabled: featureToggle.router.private.isEnabled,
});

const zorgnedAanvragenOauthMiddleware = OAuthVerificationHandler(
  OAUTH_ROLE_ZORGNED_AANVRAGEN
);

zorgnedAanvragenApiRouterPrivateNetwork.post(
  [routes.private.AANVRAGEN, routes.private.VOORZIENINGEN_JZD],
  conditional(IS_OAUTH_VERIFICATION_ENABLED, zorgnedAanvragenOauthMiddleware),
  handleAanvragenRequest
);

zorgnedAanvragenApiRouterPrivateNetwork.post(
  [routes.private.AANVRAAG_DETAIL, routes.private.VOORZIENING_JZD],
  conditional(IS_OAUTH_VERIFICATION_ENABLED, zorgnedAanvragenOauthMiddleware),
  handleAanvraagDetailRequest
);

export const zorgnedAanvragenApiRouter = {
  private: zorgnedAanvragenApiRouterPrivateNetwork,
};
