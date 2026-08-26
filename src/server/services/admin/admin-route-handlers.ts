import type { NextFunction, Response, Request } from 'express';

import { routes as adminRoutesGeneric } from './admin-service-config.ts';
import type { AdminIndexLocals, RequestWithSession } from './admin-types.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { DEFAULT_REQUEST_CONFIG } from '../../config/source-api.ts';
import { cacheOverview } from '../../helpers/file-cache.ts';
import {
  generateFullApiAdminUrlBFF,
  sendResponse,
} from '../../routing/route-helpers.ts';
import { routes as adminRoutesAmsAppNotifications } from '../amsapp/notifications/amsapp-notifications-service-config.ts';

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
  const links = [
    {
      title: 'Cache overzicht',
      to: generateFullApiAdminUrlBFF(
        adminRoutesGeneric.protected.CACHE_OVERVIEW
      ),
    },
    {
      title: 'Login statistieken',
      to: generateFullApiAdminUrlBFF(
        adminRoutesGeneric.protected.visitors.STATS,
        {
          authMethod: 'private',
        }
      ),
    },
    {
      title: 'App notificaties registraties',
      to: generateFullApiAdminUrlBFF(
        adminRoutesAmsAppNotifications.admin
          .NOTIFICATIONS_CONSUMER_REGISTRATION_OVERVIEW
      ),
    },
  ];

  const locals: AdminIndexLocals = {
    links,
  };

  return sendResponse(res, apiSuccessResult(locals));
}

export async function cacheOverviewHandler(_req: Request, res: Response) {
  const files = await cacheOverview();
  return res.json({
    sourceApiRequestCacheTimeoutDefault: DEFAULT_REQUEST_CONFIG.cacheTimeout,
    files,
  });
}

export async function authCheckHandler(req: Request, res: Response) {
  const reqWithSession = req as RequestWithSession;
  return res.json({
    isAuthenticated: reqWithSession.session?.isAuthenticated ? true : false,
    username: reqWithSession.session?.username ?? null,
  });
}
