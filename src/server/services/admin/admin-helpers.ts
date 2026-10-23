import type { Request } from 'express';

import { BFF_ADMIN_FRONTEND_URL } from './admin-service-config.ts';
import type { RequestWithSession } from './admin-types.ts';

export function getAdminRedirectUrl(url: string): string {
  const adminFrontendUrl = new URL(BFF_ADMIN_FRONTEND_URL);
  const adminPath = adminFrontendUrl.pathname.replace(/\/+$/, '');
  const requestedUrl = new URL(url, adminFrontendUrl);
  const isWithinAdminFrontend =
    requestedUrl.origin === adminFrontendUrl.origin &&
    requestedUrl.pathname.startsWith(adminPath);

  if (!isWithinAdminFrontend) {
    return adminFrontendUrl.href;
  }

  return requestedUrl.href;
}

export function getUsernameFromSession(req: Request): string {
  return (req as RequestWithSession).session.username;
}
