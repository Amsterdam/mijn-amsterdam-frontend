import { Breakpoints } from './../App.constants';
// Helper functions to determine screen size in JS
import { useMedia } from 'use-media';
import { detect } from 'detect-browser';

const isIE11 = detect()!.name === 'ie';

export function useIE11() {
  return isIE11;
}

export function useDesktopScreen(): boolean {
  return useMedia({ minWidth: 1025 }) || useIE11();
}

export function useTabletScreen(): boolean {
  return useMedia({ maxWidth: 1024 }) && !isIE11; // including Nexus 10
}

export function usePhoneScreen(): boolean {
  return useMedia({ maxWidth: 640 }) && !isIE11;
}
