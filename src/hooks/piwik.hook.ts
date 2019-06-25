import useScript from 'hooks/useScript';
import useRouter from 'use-react-router';
import { useEffect } from 'react';

const TrackerConfig = {
  url: 'https://piwik.data.amsterdam.nl',
  siteId: process.env.REACT_APP_SITE_ID,
  jsFilename: 'piwik.js',
  phpFilename: 'piwik.php',
};

export type ActionCategory = string;
export type ActionName =
  | 'ToggleExpandCollapse'
  | 'Show'
  | 'Hide'
  | 'Click'
  | 'ClickToggle';

type EventPayload = ['trackEvent', ActionCategory, ActionName, string, string?];

const theWindow = window as any;

// Initialize connection with Piwik
export function usePiwik() {
  theWindow._paq = theWindow._paq || [];

  if (theWindow._paq.length === 0) {
    theWindow._paq.push(['enableLinkTracking']);
    theWindow._paq.push([
      'setTrackerUrl',
      `${TrackerConfig.url}/${TrackerConfig.phpFilename}`,
    ]);
    theWindow._paq.push(['setSiteId', TrackerConfig.siteId]);
  }

  // Is only loaded once, has internal caching.
  useScript(`${TrackerConfig.url}/${TrackerConfig.jsFilename}`);
}

export function trackEvent(payload: EventPayload) {
  console.log('>', payload);
  return theWindow._paq.push(payload);
}

export function trackPageView(title?: string, url?: string) {
  console.log('> > >', document.title, document.location.href);
  return theWindow._paq.push([
    'trackPageView',
    title || document.title,
    url || document.location.href,
  ]);
}

export function itemPresentationPayload(
  category: string,
  name: string,
  presentationMethod: 'Show' | 'Hide' = 'Show',
  value?: string
): EventPayload {
  return ['trackEvent', category, presentationMethod, name, value];
}

export function trackItemPresentation(
  category: string,
  name: string,
  presentationMethod: 'Show' | 'Hide' = 'Show',
  value?: string
): EventPayload {
  return trackEvent(
    itemPresentationPayload(category, name, presentationMethod, value)
  );
}

export function itemClickPayload(
  category: string,
  name: string,
  value?: string
): EventPayload {
  return ['trackEvent', category, 'Click', name, value];
}

export function trackItemClick(
  category: string,
  name: string,
  value?: string
): EventPayload {
  return trackEvent(itemClickPayload(category, name, value));
}

export function itemClickTogglePayload(
  category: string,
  name: string,
  value?: string
): EventPayload {
  return ['trackEvent', category, 'ClickToggle', name, value];
}
