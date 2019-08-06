// Helper functions to determine screen size in JS
import { Breakpoints } from './../App.constants';
import { useMedia } from 'use-media';

var ua = window.navigator.userAgent;
var isIE = /MSIE|Trident/.test(ua);

export function useDesktopScreen(): boolean {
  return useMedia({ minWidth: Breakpoints.tablet + 1 }) || isIE;
}

export function useTabletScreen(): boolean {
  return useMedia({ maxWidth: Breakpoints.tablet }) && !isIE;
}

export function usePhoneScreen(): boolean {
  return useMedia({ maxWidth: Breakpoints.phone }) && !isIE;
}
