// Helper functions to determine screen size in JS
import { useLayoutEffect, useState } from 'react';

import { Breakpoints } from '../config/app.ts';

export type MediaQueryObject = { [key: string]: string | number | boolean };

const ua = globalThis.navigator.userAgent;
export const isIE = /MSIE|Trident/.test(ua);

function queryObjectToString(query: string | MediaQueryObject) {
  if (typeof query === 'string') {
    return query;
  }

  return Object.entries(query)
    .map(([feature, value]) => {
      const convertedFeature = feature
        .replace(/[A-Z]/g, (string: string) => `-${string.toLowerCase()}`)
        .toLowerCase();
      let convertedValue = value;

      if (typeof convertedValue === 'boolean') {
        return convertedValue ? convertedFeature : `not ${convertedFeature}`;
      }

      if (
        typeof convertedValue === 'number' &&
        /[height|width]$/.test(convertedFeature)
      ) {
        convertedValue = `${convertedValue}px`;
      }

      return `(${convertedFeature}: ${convertedValue})`;
    })
    .join(' and ');
}

export function useMediaLayout(query: MediaQueryObject): boolean {
  const queryString = queryObjectToString(query);
  const [matches, setMatches] = useState(() => {
    return !!globalThis.matchMedia(queryString).matches;
  });

  useLayoutEffect(() => {
    const mediaQuery = globalThis.matchMedia(queryString);

    if (mediaQuery.matches !== matches) {
      setMatches(!!mediaQuery.matches);
    }

    const handler = () => {
      setMatches(!!mediaQuery.matches);
    };

    // Inspired by https://github.com/kazzkiq/darkmode/pull/4/files
    try {
      mediaQuery.addEventListener('change', handler);
    } catch (e) {
      mediaQuery.addListener?.(handler);
    }
    return () => {
      try {
        mediaQuery.removeEventListener('change', handler);
      } catch (e) {
        mediaQuery.removeListener?.(handler);
      }
    };
  }, [matches, queryString]);

  return matches;
}

export function useSmallScreen(): boolean {
  return useMediaLayout({ maxWidth: Breakpoints.small });
}

export function useLandScape(): boolean {
  return useMediaLayout({ orientation: 'landscape' });
}

export function useWidescreen(): boolean {
  return useMediaLayout({ minWidth: Breakpoints.minWidthWideScreen });
}

export function useMediumScreen(): boolean {
  return useMediaLayout({ minWidth: Breakpoints.minWidthMediumScreen });
}
