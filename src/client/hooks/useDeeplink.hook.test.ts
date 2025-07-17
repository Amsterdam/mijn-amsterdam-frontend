import { renderHook } from '@testing-library/react';
import { useLocation } from 'react-router';
import { describe, it, expect, vi, Mock } from 'vitest';

import { useLocalStorage } from './storage.hook';
import { useSetDeeplinkEntry } from './useDeeplink.hook';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: vi.fn(),
}));

vi.mock('./storage.hook', () => ({
  useLocalStorage: vi.fn(),
}));

vi.mock('../App.routes', () => ({
  isPrivateRoute: vi.fn().mockReturnValue(true),
}));

describe('useSetDeeplinkEntry', () => {
  it('should set deeplink for normal page entry', () => {
    const setMockRouteEntry = vi.fn();
    (useLocalStorage as Mock).mockReturnValue([null, setMockRouteEntry]);
    (useLocation as Mock).mockReturnValue({ pathname: '/some-page' });

    renderHook(() => useSetDeeplinkEntry());
    expect(setMockRouteEntry).toHaveBeenCalledWith('/some-page?');
  });

  it('should not set deeplink for / location', () => {
    const setMockRouteEntry = vi.fn();
    (useLocalStorage as Mock).mockReturnValue([null, setMockRouteEntry]);
    (useLocation as Mock).mockReturnValue({ pathname: '/' });

    renderHook(() => useSetDeeplinkEntry());
    expect(setMockRouteEntry).not.toHaveBeenCalled();
  });

  it('should not set deeplink for /server-error-500 bffErrorRoute location', () => {
    const setMockRouteEntry = vi.fn();
    (useLocalStorage as Mock).mockReturnValue([null, setMockRouteEntry]);
    (useLocation as Mock).mockReturnValue({ pathname: '/server-error-500' });

    renderHook(() => useSetDeeplinkEntry());
    expect(setMockRouteEntry).not.toHaveBeenCalled();
  });
});
