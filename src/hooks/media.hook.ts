// Helper functions to determine screen size in JS
import { Breakpoints } from './../App.constants';
import { useMedia } from 'use-media';

var isIE11 = !!window.navigator.userAgent.indexOf('MSIE ');

export function useDesktopScreen(): boolean {
  return useMedia({ minWidth: Breakpoints.tablet + 1 }) || isIE11;
}

export function useTabletScreen(): boolean {
  return useMedia({ maxWidth: Breakpoints.tablet }) && !isIE11;
}

export function usePhoneScreen(): boolean {
  return useMedia({ maxWidth: Breakpoints.phone }) && !isIE11;
}
