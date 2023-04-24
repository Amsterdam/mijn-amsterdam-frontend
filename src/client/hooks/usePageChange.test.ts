import { renderHook } from '@testing-library/react-hooks';
import * as rrd from 'react-router-dom';
import { usePageChange } from '.';
import { NOT_FOUND_TITLE } from '../../universal/config';
import type { TrackingConfig } from '../../universal/config/routes';
import { trackPageViewWithCustomDimension } from './analytics.hook';

const testRoute = '/test/page/change';
const titleNotAuthenticated = 'test-title-NOT-authenticated';
const titleAuthenticated = 'TEST_TITLE_AUTHENTICATED';

jest.mock('./useProfileType', () => ({
  ...jest.requireActual('./useProfileType'),
  useProfileTypeValue: () => 'test-profile',
}));

jest.mock('./useTermReplacement', () => ({
  useTermReplacement: () => {
    return (input: string) => input;
  },
}));

jest.mock('./useUserCity', () => ({
  useUserCity: () => 'Amsterdam',
}));

jest.mock('./analytics.hook');

jest.mock('react-router-dom', () => {
  let pathname = '/';
  return {
    ...(jest.requireActual('react-router-dom') as object),
    useLocation: () => {
      return { pathname };
    },
    __setPathname: (name: string) => {
      pathname = name;
    },
  };
});

jest.mock('../../universal/config/routes', () => {
  return {
    ...(jest.requireActual('../../universal/config/routes') as object),
    AppRoutes: {
      TEST_PAGE_CHANGE: testRoute,
      FOO_BAR: '/',
      TEST_NO_TITLE: '/no-title',
    },
    ExcludePageViewTrackingUrls: ['/not/included'],
  };
});

jest.mock('../../universal/config/chapter', () => {
  return {
    ...(jest.requireActual('../../universal/config/chapter') as object),
    DocumentTitles: {
      [testRoute]: (config: TrackingConfig) => {
        return config.isAuthenticated
          ? titleAuthenticated
          : titleNotAuthenticated;
      },
      '/': 'Foo Bar',
    },
  };
});

describe('usePageChange', () => {
  global.window.scrollTo = jest.fn();
  global.console.info = jest.fn(); // Hide info warnings from our own code.

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should track page view when path is known', () => {
    // @ts-ignore
    rrd.__setPathname('/');
    const { result } = renderHook(() => usePageChange(true));

    expect(trackPageViewWithCustomDimension).toHaveBeenCalled();
    expect(result.error).toBeUndefined();
  });

  it('should NOT track page view when path is unknown', () => {
    // @ts-ignore
    rrd.__setPathname('/abcd');
    const { result } = renderHook(() => usePageChange(true));

    expect(trackPageViewWithCustomDimension).not.toHaveBeenCalled();
    expect(result.error).toBeUndefined();

    expect(document.title).toBe(NOT_FOUND_TITLE);
  });

  it('should NOT track page view when path is in excluded list', () => {
    // @ts-ignore
    rrd.__setPathname('/not/included');

    const { result } = renderHook(() => usePageChange(true));

    expect(trackPageViewWithCustomDimension).not.toHaveBeenCalled();
    expect(result.error).toBeUndefined();
  });

  test('Should track Undefined page title for route', () => {
    // @ts-ignore
    rrd.__setPathname('/no-title');

    renderHook(() => usePageChange(true));

    expect(trackPageViewWithCustomDimension).toHaveBeenCalledWith(
      '[undefined] /no-title',
      '/no-title',
      'test-profile',
      'Amsterdam'
    );
  });

  test('Custom page title should be tracked', () => {
    // @ts-ignore
    rrd.__setPathname(testRoute);

    renderHook(() => usePageChange(true));

    expect(document.title).toBe(titleAuthenticated);

    renderHook(() => usePageChange(false));

    expect(document.title).toBe(titleNotAuthenticated);
  });
});
