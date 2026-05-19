import type { NextFunction, Response, Request } from 'express';

import { routes as adminRoutesGeneric } from './admin-service-config.ts';
import type { RequestWithSession } from './admin-types.ts';
import { DEFAULT_REQUEST_CONFIG } from '../../config/source-api.ts';
import { cacheOverview } from '../../helpers/file-cache.ts';
import { generateFullApiAdminUrlBFF } from '../../routing/route-helpers.ts';
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
    );
  }

  next();
}

export async function adminIndexHandler(req: Request, res: Response) {
  const reqWithSession = req as RequestWithSession;
  const locals = {
    title: 'Mijn Amsterdam Admin',
    isAuthenticated: reqWithSession.session?.isAuthenticated ? true : false,
    username: reqWithSession.session?.username,
    links: reqWithSession.session?.isAuthenticated
      ? {
          Uitloggen: generateFullApiAdminUrlBFF(
            adminRoutesGeneric.public.auth.SIGNOUT
          ),
          'Cache overzicht': generateFullApiAdminUrlBFF(
            adminRoutesGeneric.protected.CACHE_OVERVIEW
          ),
          'Login statistieken': generateFullApiAdminUrlBFF(
            adminRoutesGeneric.protected.visitors.STATS,
            {
              authMethod: 'private',
            }
          ),
          'KTO tabel': generateFullApiAdminUrlBFF(
            adminRoutesUserFeedback.admin.USER_FEEDBACK_OVERVIEW_TABLE
          ),
          'App notificaties registraties': generateFullApiAdminUrlBFF(
            adminRoutesAmsAppNotifications.admin
              .NOTIFICATIONS_CONSUMER_REGISTRATION_OVERVIEW
          ),
        }
      : {
          Inloggen: generateFullApiAdminUrlBFF(
            adminRoutesGeneric.public.auth.SIGNIN
          ),
        },
  };

  return res.render('admin-index', locals);
}

export async function cacheOverviewHandler(_req: Request, res: Response) {
  const files = await cacheOverview();
  return res.json({
    sourceApiRequestCacheTimeoutDefault: DEFAULT_REQUEST_CONFIG.cacheTimeout,
    files,
  });
}
