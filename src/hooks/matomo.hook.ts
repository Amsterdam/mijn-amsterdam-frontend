import useScript from 'hooks/useScript';

const TrackerConfig = {
  url: 'https://analytics.data.amsterdam.nl',
  siteId: process.env.REACT_APP_SITE_ID,
  jsFilename: 'matomo.js',
  phpFilename: 'matomo.php',
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

function pushToMatomo(payload: any) {
  theWindow._paq = theWindow._paq || [];
  theWindow._paq.push(payload);
}

// Initialize connection with Matomo
export function useMatomo() {
  if (!theWindow._paq || theWindow._paq.length === 0) {
    pushToMatomo([
      'setTrackerUrl',
      `${TrackerConfig.url}/${TrackerConfig.phpFilename}`,
    ]);
    pushToMatomo(['setSiteId', TrackerConfig.siteId]);
    pushToMatomo(['trackPageView']);
    pushToMatomo(['enableLinkTracking']);
  }

  // Is only loaded once, has internal caching.
  useScript(`${TrackerConfig.url}/${TrackerConfig.jsFilename}`, true, true);
}

export function trackEvent(
  payload: EventPayload | [EventPayload, LinkPayload]
) {
  return pushToMatomo(payload);
}

export function trackPageView(title?: string, url?: string) {
  pushToMatomo(['setDocumentTitle', title || document.title]);
  if (referrerUrl) {
    pushToMatomo(['setReferrerUrl', referrerUrl]);
  }
  pushToMatomo(['setCustomUrl', url || document.location.href]);
  pushToMatomo(['trackPageView']);
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
