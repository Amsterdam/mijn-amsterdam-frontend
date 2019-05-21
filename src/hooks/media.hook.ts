// Helper functions to determine screen size in JS
import { useMedia } from 'use-media';

export function useLargeScreen(): boolean {
  return useMedia({ minWidth: 1025 });
}

export function useMediumScreen(): boolean {
  return useMedia({ maxWidth: 1024 });
}

export function useSmallScreen(): boolean {
  return useMedia({ maxWidth: 400 });
}
