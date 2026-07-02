import { IS_AP, IS_OT } from '../../universal/config/env.ts';
import { logger } from '../logging.ts';
import { router as adminRouter } from './app-router-admin.ts';
import { authRouterDevelopment } from './app-router-development.ts';
import { oidcRouter } from './app-router-oidc.ts';
import { router as privateNetworkRouter } from './app-router-private.ts';
import { router as protectedRouter } from './app-router-protected.ts';
import { router as routerPublicExternalConsumer } from './app-router-public-external-consumer.ts';
import { legacyRouter, router as publicRouter } from './app-router-public.ts';
import {
  BffEndpoints,
  BFF_BASE_PATH,
  BFF_BASE_PATH_ADMIN,
  BFF_BASE_PATH_PRIVATE,
} from './bff-routes.ts';
import { handleIsAuthenticated, nocache } from './route-handlers.ts';
import { createBFFRouter, generateFullApiUrlBFF } from './route-helpers.ts';

type CreateMainRouterOptions = {
  isOT: boolean;
  isAP: boolean;
};

export function createMainRouter({
  isOT: isOT,
  isAP: isAP,
}: CreateMainRouterOptions) {
  const router = createBFFRouter({ id: 'router-main' });

  // Some legacy routes that are not prefixed with /api/v1
  router.use(legacyRouter);

  ////////////////////////////////////////////////////////////////////////
  ///// The public router has routes that can be accessed by anyone without any authentication.
  ////////////////////////////////////////////////////////////////////////
  router.use(BFF_BASE_PATH, publicRouter);

  ///// [DEVELOPMENT - TEST]
  //// In development we use the authRouterDevelopment which has a mock login.
  if (isOT && !isAP) {
    logger.info('Using AUTH Development Router');
    router.use(BFF_BASE_PATH, authRouterDevelopment);
  }
  ///// [PRODUCTION - ACCEPTANCE]
  //// In production we use the oidcRouter which has real OIDC login.
  if (isAP && !isOT) {
    logger.info('Using AUTH OIDC Router');
    router.use(BFF_BASE_PATH, oidcRouter);
  }

  router.use(BFF_BASE_PATH, nocache, routerPublicExternalConsumer);

  // Routes mounted at BFF_BASE_PATH_ADMIN are for the admin panel.
  // These routes require authentication but are separate from the other protected routes, and have their own authentication middleware defined in app-router-admin.ts
  router.use(BFF_BASE_PATH_ADMIN, nocache, adminRouter);

  // Routers mounted at BFF_BASE_PATH all need authentication.
  router.use(BFF_BASE_PATH, nocache, handleIsAuthenticated, protectedRouter);

  /////////////////////////////////////////////////////////////////////////
  ///// These routes are not protected by TMA/OIDC system, but
  ///// are protected by other means (e.g. IP whitelisting, API keys, etc).
  ///// These routers are all prefixed with /private and not accessible
  ///// from the public internet.
  ////////////////////////////////////////////////////////////////////////
  router.use(BFF_BASE_PATH_PRIVATE, nocache, privateNetworkRouter);

  // Redirects to /api/v1
  router.get(BffEndpoints.ROOT, (_req, res) => {
    return res.redirect(generateFullApiUrlBFF(BffEndpoints.ROOT));
  });

  return router;
}

export const router = createMainRouter({ isOT: IS_OT, isAP: IS_AP });
