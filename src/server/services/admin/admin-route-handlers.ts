import type { NextFunction, Response, Request } from 'express';

import { routes } from './admin-service-config.ts';
import type { RequestWithSession } from './admin-types.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { DEFAULT_REQUEST_CONFIG } from '../../config/source-api.ts';
import { cacheOverview } from '../../helpers/file-cache.ts';
import {
  generateFullApiAdminUrlBFF,
  sendResponse,
} from '../../routing/route-helpers.ts';

// custom middleware to check auth state
export function isAuthenticatedAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!(req as RequestWithSession).session?.isAuthenticated) {
    return res.redirect(generateFullApiAdminUrlBFF(routes.public.auth.SIGNIN)); // redirect to sign-in route
  }

  next();
}

export async function adminIndexHandler(req: Request, res: Response) {
  const reqWithSession = req as RequestWithSession;
  sendResponse(
    res,
    apiSuccessResult({
      title: 'Mijn Amsterdam Admin API',
      isAuthenticated: reqWithSession.session?.isAuthenticated ? true : false,
      username: reqWithSession.session?.account?.username,
      links: {
        login: generateFullApiAdminUrlBFF(routes.public.auth.SIGNIN),
        logout: generateFullApiAdminUrlBFF(routes.public.auth.SIGNOUT),
        cacheOverview: generateFullApiAdminUrlBFF(
          routes.protected.CACHE_OVERVIEW
        ),
        loginStats: generateFullApiAdminUrlBFF(
          routes.protected.visitors.STATS,
          { authMethod: '' }
        ),
        loginStatsTable: generateFullApiAdminUrlBFF(
          routes.protected.visitors.STATS_TABLE
        ),
      },
    })
  );
}

export async function cacheOverviewHandler(_req: Request, res: Response) {
  const files = await cacheOverview();
  return res.json({
    sourceApiRequestCacheTimeoutDefault: DEFAULT_REQUEST_CONFIG.cacheTimeout,
    files,
  });
}
