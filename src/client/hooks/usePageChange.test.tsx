import { ReactNode } from 'react';

import { renderHook } from '@testing-library/react';
import * as rrd from 'react-router';
import { afterAll, afterEach, describe, expect, it, test, vi } from 'vitest';

import { usePageChange } from './usePageChange';
import type { TrackingConfig } from '../config/routes';
import { NOT_FOUND_TITLE } from '../config/thema';

const mocks = vi.hoisted(() => {
  return {
    pathname: '/',
    testRoute: '/test/page/change',
    titleNotAuthenticated: 'test-title-NOT-authenticated',
    titleAuthenticated: 'TEST_TITLE_AUTHENTICATED',
    trackPageViewWithCustomDimension: vi.fn(),
  };
});

vi.mock('react-router', async (requireActual) => {
  const origModule: object = await requireActual();
  return {
    ...origModule,
    __setPathname: (name: string) => {
      mocks.pathname = name;
    },
    useLocation: () => {
      return { pathname: mocks.pathname };
    },
    useNavigate: () => vi.fn(),
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

vi.mock('../config/thema', async (requireActual) => {
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

// vi.mock('./analytics.hook', async (requireActual) => {
//   const origModule: object = await requireActual();
//   return {
//     ...origModule,
//     trackPageViewWithCustomDimension: vi.fn(),
//   };
// });

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

    expect(mocks.trackPageViewWithCustomDimension).toHaveBeenCalled();
  });

  it('should NOT track page view when path is unknown', () => {
    // @ts-ignore
    rrd.__setPathname('/abcd');
    renderHook(() => usePageChange(true));

    expect(mocks.trackPageViewWithCustomDimension).not.toHaveBeenCalled();

    expect(document.title).toBe(NOT_FOUND_TITLE);
  });

  it('should NOT track page view when path is in excluded list', () => {
    // @ts-ignore
    rrd.__setPathname('/not/included');

    renderHook(() => usePageChange(true));

    expect(mocks.trackPageViewWithCustomDimension).not.toHaveBeenCalled();
  });

  test('Should track Undefined page title for route', () => {
    // @ts-ignore
    rrd.__setPathname('/no-title');

    renderHook(() => usePageChange(true));

    expect(mocks.trackPageViewWithCustomDimension).toHaveBeenCalledWith(
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

    expect(mocks.trackPageViewWithCustomDimension).toHaveBeenCalledWith(
      'Mijn buurt',
      '/buurt',
      'private-attributes',
      'Amsterdam'
    );
  });

  describe('scrollOnPageChange', () => {
    const mockScrollTo = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      // Mock window.scrollTo
      Object.defineProperty(window, 'scrollTo', {
        value: mockScrollTo,
        writable: true,
      });
    });

    it('should scroll to top when when scrollY is higher than skip-to-id-AppContent offsetTop', () => {
      // Set up the mock to return null for getElementById
      document.getElementById = vi.fn().mockReturnValue(null);

      // @ts-ignore
      rrd.__setPathname('/page1');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
      );

      const { rerender } = renderHook(() => usePageChange(true), { wrapper });

      // set new page to trigger scroll
      // @ts-ignore
      rrd.__setPathname('/page2');

      Object.defineProperty(window, 'scrollY', {
        value: 1000,
        writable: true,
      });

      rerender();

      expect(mockScrollTo).toHaveBeenCalledWith({
        behavior: 'instant',
        top: 0,
      });
    });
  });
});
