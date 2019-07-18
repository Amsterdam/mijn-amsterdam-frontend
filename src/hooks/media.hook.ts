import { Breakpoints } from './../App.constants';
// Helper functions to determine screen size in JS
import { useMedia } from 'use-media';

export function useDesktopScreen(): boolean {
  return useMedia({ minWidth: Breakpoints.tablet + 1 });
}

export function useTabletScreen(): boolean {
  return useMedia({ maxWidth: Breakpoints.tablet }); // including Nexus 10
}

export function usePhoneScreen(): boolean {
  return useMedia({ maxWidth: Breakpoints.phone });
}
