import useScript from 'hooks/useScript';

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

function pushToPiwik(payload: any) {
  theWindow._paq = theWindow._paq || [];
  theWindow._paq.push(payload);
}

// Initialize connection with Piwik
export function usePiwik() {
  if (!theWindow._paq || theWindow._paq.length === 0) {
    pushToPiwik([
      'setTrackerUrl',
      `${TrackerConfig.url}/${TrackerConfig.phpFilename}`,
    ]);
    pushToPiwik(['setSiteId', TrackerConfig.siteId]);
    pushToPiwik(['trackPageView']);
    pushToPiwik(['enableLinkTracking']);
  }

  // Is only loaded once, has internal caching.
  useScript(`${TrackerConfig.url}/${TrackerConfig.jsFilename}`, true, true);
}

export function trackEvent(
  payload: EventPayload | [EventPayload, LinkPayload]
) {
  return pushToPiwik(payload);
}

export function trackPageView(title?: string, url?: string) {
  pushToPiwik(['setDocumentTitle', title || document.title]);
  if (referrerUrl) {
    pushToPiwik(['setReferrerUrl', referrerUrl]);
  }
  pushToPiwik(['setCustomUrl', url || document.location.href]);
  pushToPiwik(['trackPageView']);
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
