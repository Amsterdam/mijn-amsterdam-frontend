import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock external msal package to avoid side effects
vi.mock('msal', () => ({
  PublicClientApplication: vi.fn(),
}));

// Mock cacheOverview for the cacheOverviewHandler
vi.mock('../../helpers/file-cache.ts', () => ({
  cacheOverview: vi.fn(() => Promise.resolve(['file-a.json', 'file-b.json'])),
}));

import {
  isAuthenticatedAdmin,
  adminIndexHandler,
  cacheOverviewHandler,
} from './admin-route-handlers.ts';
import { RequestMock, ResponseMock } from '../../../testing/utils.ts';
import { DEFAULT_REQUEST_CONFIG } from '../../config/source-api.ts';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('admin-route-handlers', () => {
  it('redirects to signin when not authenticated (isAuthenticatedAdmin)', () => {
    const req = RequestMock.new().setUrl('/admin/protected/route').get();

    const res = ResponseMock.new();
    const next = vi.fn();

    isAuthenticatedAdmin(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(
      '/api/v1/admin/auth/signin?originalUrl=%2Fadmin%2Fprotected%2Froute'
    );
  });

  it('calls next when authenticated (isAuthenticatedAdmin)', () => {
    const req = RequestMock.new();
    // attach minimal session shape expected by middleware
    Object.assign(req, { session: { isAuthenticated: true } });

    const res = ResponseMock.new();
    const next = vi.fn();

    isAuthenticatedAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('renders admin-index with authenticated links (adminIndexHandler)', async () => {
    const req = RequestMock.new();
    Object.assign(req, {
      session: { isAuthenticated: true, username: 'Alice' },
    });
    const res = ResponseMock.new();

    await adminIndexHandler(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'admin-index',
      expect.objectContaining({
        title: 'Mijn Amsterdam Admin',
        isAuthenticated: true,
        username: 'Alice',
        links: expect.any(Object),
      })
    );
  });

  it('renders admin-index with login link when not authenticated (adminIndexHandler)', async () => {
    const req = RequestMock.new();
    Object.assign(req, { session: { isAuthenticated: false } });
    const res = ResponseMock.new();

    await adminIndexHandler(req, res);

    expect(res.render).toHaveBeenCalledWith(
      'admin-index',
      expect.objectContaining({
        isAuthenticated: false,
        links: {
          Inloggen: '/api/v1/admin/auth/signin',
        },
        title: 'Mijn Amsterdam Admin',
        username: undefined,
      })
    );
  });

  it('returns cache overview JSON (cacheOverviewHandler)', async () => {
    const req = RequestMock.new().get();
    const res = ResponseMock.new();
    // attach json spy because ResponseMock doesn't include it
    res.json = vi.fn();

    await cacheOverviewHandler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceApiRequestCacheTimeoutDefault:
          DEFAULT_REQUEST_CONFIG.cacheTimeout,
        files: expect.any(Array),
      })
    );
  });
});
