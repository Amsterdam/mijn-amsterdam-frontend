// Helper functions to determine screen size in JS
import { useMedia } from 'use-media';

export function isLargeScreen(): boolean {
  return useMedia({ minWidth: 1025 });
}

export function isMediumScreen(): boolean {
  return useMedia({ maxWidth: 1024 });
}

export function isSmallScreen(): boolean {
  return useMedia({ maxWidth: 400 });
}
