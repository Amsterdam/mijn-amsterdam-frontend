import type { NextFunction, Response, Request } from 'express';

import { routes as adminRoutesGeneric } from './admin-service-config.ts';
import type { RequestWithSession } from './admin-types.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { DEFAULT_REQUEST_CONFIG } from '../../config/source-api.ts';
import { cacheOverview } from '../../helpers/file-cache.ts';
import {
  generateFullApiAdminUrlBFF,
  sendResponse,
} from '../../routing/route-helpers.ts';
import { routes as adminRoutesAmsAppNotifications } from '../amsapp/notifications/amsapp-notifications-service-config.ts';
import { routes as adminRoutesUserFeedback } from '../user-feedback/user-feedback.service-config.ts';

// custom middleware to check auth state
export function isAuthenticatedAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!(req as RequestWithSession).session?.isAuthenticated) {
    return res.redirect(
      generateFullApiAdminUrlBFF(adminRoutesGeneric.public.auth.SIGNIN, [
        { originalUrl: req.originalUrl },
      ])
    ); // redirect to sign-in route
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
        login: generateFullApiAdminUrlBFF(
          adminRoutesGeneric.public.auth.SIGNIN
        ),
        logout: generateFullApiAdminUrlBFF(
          adminRoutesGeneric.public.auth.SIGNOUT
        ),
        cacheOverview: generateFullApiAdminUrlBFF(
          adminRoutesGeneric.protected.CACHE_OVERVIEW
        ),
        loginStats: generateFullApiAdminUrlBFF(
          adminRoutesGeneric.protected.visitors.STATS,
          { authMethod: '' }
        ),
        loginStatsTable: generateFullApiAdminUrlBFF(
          adminRoutesGeneric.protected.visitors.STATS_TABLE
        ),
        userFeedback: generateFullApiAdminUrlBFF(
          adminRoutesUserFeedback.admin.USER_FEEDBACK_OVERVIEW_TABLE
        ),
        appRegistratons: generateFullApiAdminUrlBFF(
          adminRoutesAmsAppNotifications.admin
            .NOTIFICATIONS_CONSUMER_REGISTRATION_OVERVIEW
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
