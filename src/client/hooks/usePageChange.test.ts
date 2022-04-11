import * as rrd from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks';
import { usePageChange } from '.';
import { trackPageViewWithCustomDimensions } from './analytics.hook';

jest.mock('./useProfileType');
jest.mock('./useUserCity', () => ({
  useUserCity: () => 'Onbekend',
}));
jest.mock('./useTermReplacement', () => ({
  useTermReplacement: () => {
    return jest.fn();
  },
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

describe('usePageChange', () => {
  global.window.scrollTo = jest.fn();
  global.console.info = jest.fn(); // Hide info warnings from our own code.

  it('should track page view when path is known', () => {
    // @ts-ignore
    rrd.__setPathname('/');
    const { result } = renderHook(() => usePageChange());

    expect(trackPageViewWithCustomDimensions).toHaveBeenCalled();
    expect(result.error).toBeUndefined();
  });

  it('should NOT track page view when path is unknown', () => {
    // @ts-ignore
    rrd.__setPathname('/abcd');
    const { result } = renderHook(() => usePageChange());

    expect(trackPageViewWithCustomDimensions).not.toHaveBeenCalled();
    expect(result.error).toBeUndefined();
  });

  it('should NOT track page view when path is in excluded list', () => {
    // @ts-ignore
    rrd.__setPathname('/test-api/login');

    const { result } = renderHook(() => usePageChange());

    expect(trackPageViewWithCustomDimensions).not.toHaveBeenCalled();
    expect(result.error).toBeUndefined();
  });
});
