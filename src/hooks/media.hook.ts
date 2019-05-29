// Helper functions to determine screen size in JS
import { useMedia } from 'use-media';

export function useLargeScreen(): boolean {
  return useMedia({ minWidth: 1025 });
}

export function useTabletScreen(): boolean {
  return useMedia({ maxWidth: 768 });
}

export function usePhoneScreen(): boolean {
  return useMedia({ maxWidth: 640 });
}
