import { describe, expect, it } from 'vitest';

import { getAdminRedirectUrl } from './admin-helpers.ts';
import { BFF_API_ADMIN_BASE_URL } from '../../config/app.ts';
import { BFF_BASE_PATH_ADMIN } from '../../routing/bff-routes.ts';

describe('getAdminRedirectUrl', () => {
  it('returns the original url when it starts with BFF_API_ADMIN_BASE_URL', () => {
    const url = `${BFF_API_ADMIN_BASE_URL}/manage`;
    expect(getAdminRedirectUrl(url)).toBe(url);
  });

  it('returns the original url when it starts with BFF_BASE_PATH_ADMIN', () => {
    const url = `${BFF_BASE_PATH_ADMIN}/dashboard`;
    expect(getAdminRedirectUrl(url)).toBe(url);
  });

  it('returns BFF_API_ADMIN_BASE_URL when url does not start with admin prefixes', () => {
    const url = '/some/other/path';
    expect(getAdminRedirectUrl(url)).toBe(BFF_API_ADMIN_BASE_URL);
  });
});
