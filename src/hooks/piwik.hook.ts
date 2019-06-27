import useScript from 'hooks/useScript';
import useRouter from 'use-react-router';
import { useEffect } from 'react';
import { link } from 'fs';

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
  | 'Show_on_load'
  | 'Click'
  | 'MouseEnter'
  | 'MouseLeave'
  | 'Callback'
  | 'Redirect'
  | 'ClickToggle';
type LinkType = 'link' | 'download';
type EventPayload = ['trackEvent', ActionCategory, ActionName, string, string?];
type LinkPayload = ['trackLink', string, LinkType];

const theWindow = window as any;
let referrerUrl: string;

// Initialize connection with Piwik
export function usePiwik() {
  theWindow._paq = theWindow._paq || [];

  if (theWindow._paq.length === 0) {
    theWindow._paq.push(['enableLinkTracking']);
    theWindow._paq.push(['setUserId', 'Tim']);
    theWindow._paq.push([
      'setTrackerUrl',
      `${TrackerConfig.url}/${TrackerConfig.phpFilename}`,
    ]);
    theWindow._paq.push(['setSiteId', TrackerConfig.siteId]);
  }

  // Is only loaded once, has internal caching.
  useScript(`${TrackerConfig.url}/${TrackerConfig.jsFilename}`);
}

export function trackEvent(
  payload: EventPayload | [EventPayload, LinkPayload]
) {
  return theWindow._paq.push(payload);
}

export function trackPageView(title?: string, url?: string) {
  theWindow._paq.push(['setDocumentTitle', title || document.title]);
  if (referrerUrl) {
    theWindow._paq.push(['setReferrerUrl', referrerUrl]);
  }
  theWindow._paq.push(['setCustomUrl', url || document.location.href]);
  theWindow._paq.push(['trackPageView']);
  referrerUrl = url || document.location.href;
}

export function itemPresentationPayload(
  category: string,
  name: string,
  value?: string
): EventPayload {
  return ['trackEvent', category, 'Show_on_load', name, value];
}

export function trackItemPresentation(
  category: string,
  name: string,
  value?: string
) {
  trackEvent(itemPresentationPayload(category, name, value));
}

export function itemInteractionPayload(
  action: ActionName = 'Click',
  category: string,
  name: string,
  value?: string,
  linkType?: LinkType
): EventPayload | [EventPayload, LinkPayload] {
  if (typeof linkType !== 'undefined') {
    return [
      ['trackEvent', category, action, name],
      ['trackLink', value || '', linkType],
    ];
  }
  return ['trackEvent', category, action, name, value];
}
export function itemClickPayload(
  category: string,
  name: string,
  value?: string,
  linkType?: LinkType
): EventPayload | [EventPayload, LinkPayload] {
  return itemInteractionPayload('Click', category, name, value, linkType);
}

export function trackItemClick(
  category: string,
  name: string,
  value?: string,
  linkType?: LinkType
) {
  trackEvent(itemClickPayload(category, name, value, linkType));
}

export function itemClickTogglePayload(
  category: string,
  name: string,
  value?: string
): EventPayload {
  return ['trackEvent', category, 'ClickToggle', name, value];
}
