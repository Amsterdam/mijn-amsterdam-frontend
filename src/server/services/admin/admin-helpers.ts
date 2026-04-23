import { BFF_API_ADMIN_BASE_URL } from '../../config/app.ts';
import { BFF_BASE_PATH_ADMIN } from '../../routing/bff-routes.ts';

export function getAdminRedirectUrl(url: string): string {
  return url.startsWith(BFF_API_ADMIN_BASE_URL) ||
    url.startsWith(BFF_BASE_PATH_ADMIN)
    ? url
    : BFF_API_ADMIN_BASE_URL;
}
