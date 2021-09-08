// Helper functions to determine screen size in JS
import { createContext, useContext } from 'react';
import { useMediaLayout } from 'use-media';
import { Breakpoints } from '../config/app';

interface MediaQueryContextType {
  isPhoneScreen: boolean;
  isDesktopScreen: boolean;
  isTabletScreen: boolean;
  isWideScreen: boolean;
  hasScreen: boolean;
}

export const MediaQueryContext = createContext<MediaQueryContextType>({
  isPhoneScreen: false,
  isDesktopScreen: false,
  isTabletScreen: false,
  isWideScreen: false,
  hasScreen: false,
});

const ua = window.navigator.userAgent;
export const isIE = /MSIE|Trident/.test(ua);

export function useDesktopScreen(): boolean {
  return useMediaLayout({ minWidth: Breakpoints.tablet + 1 });
}

export function useTabletScreen(): boolean {
  return useMediaLayout({
    maxWidth: Breakpoints.tablet,
  });
}

export function usePhoneScreen(): boolean {
  return useMediaLayout({ maxWidth: Breakpoints.phone });
}

export function useWidescreen(): boolean {
  return useMediaLayout({ minWidth: Breakpoints.wideScreen });
}

export function useMediaQueryContext() {
  return useContext(MediaQueryContext);
}
