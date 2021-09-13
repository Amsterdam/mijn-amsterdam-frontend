// Helper functions to determine screen size in JS
import { useLayoutEffect, useState } from 'react';
import { Breakpoints } from '../config/app';

export type MediaQueryObject = { [key: string]: string | number | boolean };

const ua = window.navigator.userAgent;
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

export function useMediaLayout(query: MediaQueryObject) {
  const queryString = queryObjectToString(query);
  const [matches, setMatches] = useState(() => {
    return !!window.matchMedia(queryString).matches;
  });

  useLayoutEffect(() => {
    const media = window.matchMedia(queryString);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, queryString]);

  return matches;
}

export function useDesktopScreen(): boolean {
  return useMediaLayout({ minWidth: Breakpoints.tablet + 1 });
}

export function useTabletScreen(): boolean {
  return useMediaLayout({
    maxWidth: Breakpoints.tablet,
  });
}

export function usePhoneScreen(): boolean {
  return useMediaLayout({ maxWidth: Breakpoints.phone });
}

export function useWidescreen(): boolean {
  return useMediaLayout({ minWidth: Breakpoints.wideScreen });
}
