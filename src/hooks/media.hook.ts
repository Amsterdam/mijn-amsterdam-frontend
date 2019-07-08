// Helper functions to determine screen size in JS
import { useMedia } from 'use-media';

export function useDesktopScreen(): boolean {
  return useMedia({ minWidth: 1025 });
}

export function useTabletScreen(): boolean {
  return useMedia({ maxWidth: 1024 }); // including Nexus 10
}

export function usePhoneScreen(): boolean {
  return useMedia({ maxWidth: 640 });
}
