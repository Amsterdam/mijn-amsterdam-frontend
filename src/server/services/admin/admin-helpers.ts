import type { Request } from 'express';

import type { RequestWithSession } from './admin-types.ts';
import { BFF_API_ADMIN_BASE_URL } from '../../config/app.ts';
import { BFF_BASE_PATH_ADMIN } from '../../routing/bff-routes.ts';
import { generateMaFrontendUrl } from '../../routing/route-helpers.ts';

export function getAdminRedirectUrl(url: string): string {
  const requestedPath = url.split('?')[0];
  const adminPaths = [BFF_BASE_PATH_ADMIN, BFF_API_ADMIN_BASE_URL];
  const isAdminRoot = adminPaths.some(
    (path) => requestedPath === path || requestedPath === `${path}/`
  );
  const isAdminSubroute = adminPaths.some((path) =>
    requestedPath.startsWith(`${path}/`)
  );

  if (isAdminRoot || !isAdminSubroute) {
    return generateMaFrontendUrl('/admin');
  }

  return url;
}

export function getUsernameFromSession(req: Request): string {
  return (req as RequestWithSession).session.username;
}
