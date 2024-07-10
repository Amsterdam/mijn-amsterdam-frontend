import { renderHook } from '@testing-library/react';
import * as rrd from 'react-router-dom';
import { afterAll, afterEach, describe, expect, it, test, vi } from 'vitest';
import { NOT_FOUND_TITLE } from '../config/thema';
import type { TrackingConfig } from '../../universal/config/routes';
import { trackPageViewWithCustomDimension } from './analytics.hook';
import { usePageChange } from './usePageChange';

const mocks = vi.hoisted(() => {
  return {
    pathname: '/',
    testRoute: '/test/page/change',
    titleNotAuthenticated: 'test-title-NOT-authenticated',
    titleAuthenticated: 'TEST_TITLE_AUTHENTICATED',
  };
});

vi.mock('react-router-dom', async (requireActual) => {
  const origModule: object = await requireActual();
  return {
    ...origModule,
    useLocation: () => {
      return { pathname: mocks.pathname };
    },
    __setPathname: (name: string) => {
      mocks.pathname = name;
    },
  };
});

vi.mock('../../universal/config/routes', async (requireActual) => {
  const origModule: object = await requireActual();
  return {
    ...origModule,
    AppRoutes: {
      TEST_PAGE_CHANGE: mocks.testRoute,
      FOO_BAR: '/',
      TEST_NO_TITLE: '/no-title',
      BUURT: '/buurt',
    },
  };
});

vi.mock('../config/api', async (requireActual) => {
  const origModule: object = await requireActual();
  return {
    ...origModule,
    ExcludePageViewTrackingUrls: ['/not/included'],
  };
});

vi.mock('./useTermReplacement', () => ({
  useTermReplacement: () => {
    return (input: string) => input;
  },
}));

vi.mock('./useUserCity', () => ({
  useUserCity: () => 'Amsterdam',
}));

vi.mock('./useProfileType', async (requireActual) => {
  const origModule: object = await requireActual();
  return {
    ...origModule,
    useProfileTypeValue: () => 'private-attributes',
  };
});

vi.mock('../../universal/config/thema', async (requireActual) => {
  const origModule: object = await requireActual();
  return {
    ...origModule,
    DocumentTitles: {
      [mocks.testRoute]: (config: TrackingConfig) => {
        return config.isAuthenticated
          ? mocks.titleAuthenticated
          : mocks.titleNotAuthenticated;
      },
      '/': 'Foo Bar',
      '/buurt': 'Mijn buurt',
    },
  };
});

vi.mock('./analytics.hook', async (requireActual) => {
  const origModule: object = await requireActual();
  return {
    ...origModule,
    trackPageViewWithCustomDimension: vi.fn(),
  };
});

describe('usePageChange', () => {
  // global.console.info = vi.fn(); // Hide info warnings from our own code.

  afterAll(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should track page view when path is known', () => {
    // @ts-ignore
    rrd.__setPathname('/');
    renderHook(() => usePageChange(true));

    expect(trackPageViewWithCustomDimension).toHaveBeenCalled();
  });

  it('should NOT track page view when path is unknown', () => {
    // @ts-ignore
    rrd.__setPathname('/abcd');
    renderHook(() => usePageChange(true));

    expect(trackPageViewWithCustomDimension).not.toHaveBeenCalled();

    expect(document.title).toBe(NOT_FOUND_TITLE);
  });

  it('should NOT track page view when path is in excluded list', () => {
    // @ts-ignore
    rrd.__setPathname('/not/included');

    renderHook(() => usePageChange(true));

    expect(trackPageViewWithCustomDimension).not.toHaveBeenCalled();
  });

  test('Should track Undefined page title for route', () => {
    // @ts-ignore
    rrd.__setPathname('/no-title');

    renderHook(() => usePageChange(true));

    expect(trackPageViewWithCustomDimension).toHaveBeenCalledWith(
      '[undefined] /no-title',
      '/no-title',
      'private-attributes',
      'Amsterdam'
    );
  });

  test('Custom page title should be tracked', () => {
    // @ts-ignore
    rrd.__setPathname(mocks.testRoute);

    renderHook(() => usePageChange(true));

    expect(document.title).toBe(mocks.titleAuthenticated);

    renderHook(() => usePageChange(false));

    expect(document.title).toBe(mocks.titleNotAuthenticated);
  });

  test('Should track the MA theme of a page', () => {
    // @ts-ignore
    rrd.__setPathname('/buurt');

    renderHook(() => usePageChange(true));

    expect(trackPageViewWithCustomDimension).toHaveBeenCalledWith(
      'Mijn buurt',
      '/buurt',
      'private-attributes',
      'Amsterdam'
    );
  });
});
