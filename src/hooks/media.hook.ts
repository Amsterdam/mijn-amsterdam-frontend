// Helper functions to determine screen size in JS
import { useMedia } from 'use-media';
import { Breakpoints } from './../App.constants';

const ua = window.navigator.userAgent;
export const isIE = /MSIE|Trident/.test(ua);

export function useDesktopScreen(): boolean {
  return useMedia({ minWidth: Breakpoints.tablet + 1 });
}

export function useTabletScreen(): boolean {
  return useMedia({
    maxWidth: Breakpoints.tablet,
  });
}

export function usePhoneScreen(): boolean {
  return useMedia({ maxWidth: Breakpoints.phone });
}
