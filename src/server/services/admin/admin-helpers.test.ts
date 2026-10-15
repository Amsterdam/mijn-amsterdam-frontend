import { describe, expect, it } from 'vitest';

import { getAdminRedirectUrl } from './admin-helpers.ts';
import { BFF_ADMIN_FRONTEND_URL } from './admin-service-config.ts';
import { BFF_API_ADMIN_BASE_URL } from '../../config/app.ts';
import { BFF_BASE_PATH_ADMIN } from '../../routing/bff-routes.ts';

describe('getAdminRedirectUrl', () => {
  const adminFrontendUrl = new URL(BFF_ADMIN_FRONTEND_URL);

  it('redirects the admin API root to the admin frontend', () => {
    expect(getAdminRedirectUrl(BFF_BASE_PATH_ADMIN)).toBe(
      adminFrontendUrl.href
    );
    expect(getAdminRedirectUrl(BFF_API_ADMIN_BASE_URL)).toBe(
      adminFrontendUrl.href
    );
    expect(getAdminRedirectUrl(`${BFF_BASE_PATH_ADMIN}/?view=cache`)).toBe(
      adminFrontendUrl.href
    );
  });

  it('redirects admin API subroutes to the admin frontend', () => {
    const url = `${BFF_API_ADMIN_BASE_URL}/manage`;
    expect(getAdminRedirectUrl(url)).toBe(adminFrontendUrl.href);
  });

  it('redirects admin BFF subroutes to the admin frontend', () => {
    const url = `${BFF_BASE_PATH_ADMIN}/dashboard`;
    expect(getAdminRedirectUrl(url)).toBe(adminFrontendUrl.href);
  });

  it('preserves admin frontend pages, including query and hash', () => {
    const adminPath = adminFrontendUrl.pathname;
    const url = `${adminPath}/user-feedback?status=open#entry-123`;
    expect(getAdminRedirectUrl(url)).toBe(
      new URL(`${adminPath}/user-feedback?status=open#entry-123`, adminFrontendUrl)
        .href
    );
  });

  it('redirects paths outside the admin frontend to the admin home', () => {
    const url = '/some/other/path';
    expect(getAdminRedirectUrl(url)).toBe(adminFrontendUrl.href);
  });

  it('redirects normalized paths outside the admin frontend to the admin home', () => {
    const url = `${adminFrontendUrl.pathname}/../../other`;
    expect(getAdminRedirectUrl(url)).toBe(adminFrontendUrl.href);
  });
});
