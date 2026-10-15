import type { Request } from 'express';

import type { RequestWithSession } from './admin-types.ts';
import { generateMaFrontendUrl } from '../../routing/route-helpers.ts';

export function getAdminRedirectUrl(url: string): string {
  const adminHomeUrl = generateMaFrontendUrl('/admin');
  const isAdminPath = url.startsWith('/admin/')

  if (!isAdminPath) {
    return adminHomeUrl;
  }

  const requestedUrl = new URL(url, adminHomeUrl);

  return requestedUrl.href;
}

export function getUsernameFromSession(req: Request): string {
  return (req as RequestWithSession).session.username;
}
