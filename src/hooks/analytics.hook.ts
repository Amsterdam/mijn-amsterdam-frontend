import useScript from 'hooks/useScript';

const TrackerConfig = {
  url: 'https://analytics.data.amsterdam.nl',
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

function pushToAnalytics(payload: any) {
  theWindow._paq = theWindow._paq || [];
  theWindow._paq.push(payload);
}

// Initialize connection with analytics
export function useAnalytics() {
  if (!theWindow._paq || theWindow._paq.length === 0) {
    pushToAnalytics([
      'setTrackerUrl',
      `${TrackerConfig.url}/${TrackerConfig.phpFilename}`,
    ]);
    pushToAnalytics(['setSiteId', TrackerConfig.siteId]);
    pushToAnalytics(['trackPageView']);
    pushToAnalytics(['enableLinkTracking']);
  }

  // Is only loaded once, has internal caching.
  useScript(`${TrackerConfig.url}/${TrackerConfig.jsFilename}`, true, true);
}

export function trackEvent(
  payload: EventPayload | [EventPayload, LinkPayload]
) {
  return pushToAnalytics(payload);
}

export function trackPageView(title?: string, url?: string) {
  pushToAnalytics(['setDocumentTitle', title || document.title]);
  if (referrerUrl) {
    pushToAnalytics(['setReferrerUrl', referrerUrl]);
  }
  pushToAnalytics(['setCustomUrl', url || document.location.href]);
  pushToAnalytics(['trackPageView']);
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
