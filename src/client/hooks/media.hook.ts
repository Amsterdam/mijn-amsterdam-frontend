// Helper functions to determine screen size in JS
import { useMediaLayout } from 'use-media';
import { Breakpoints } from '../config/app';

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
