import MatomoTracker from '@datapunt/matomo-tracker-js';
import { TrackEventParams } from '@datapunt/matomo-tracker-js/lib/types';
import { useDebouncedCallback } from 'use-debounce';
import { useSessionStorage } from './storage.hook';

let MatomoInstance: MatomoTracker;
const hasSiteId = !!process.env.REACT_APP_ANALYTICS_SITE_ID;
const siteId = hasSiteId ? Number(process.env.REACT_APP_ANALYTICS_SITE_ID) : -1;
const MatomoTrackerConfig = {
  urlBase: 'https://analytics.data.amsterdam.nl/',
  siteId,
};

// Initialize connection with analytics
export function useAnalytics() {
  if (hasSiteId && !MatomoInstance) {
    MatomoInstance = new MatomoTracker(MatomoTrackerConfig);
  }
}

export function trackEvent(payload: TrackEventParams) {
  return MatomoInstance && MatomoInstance.trackEvent(payload);
}

export function trackPageView(title?: string, url?: string) {
  const payload = {
    documentTitle: title || document.title,
    href: url || document.location.href,
  };
  return MatomoInstance && MatomoInstance.trackPageView(payload);
}

export function trackDownload(url: string) {
  return (
    MatomoInstance &&
    MatomoInstance.trackLink({
      href: url,
      linkType: 'download',
    })
  );
}

export function trackLink(url: string) {
  return (
    MatomoInstance &&
    MatomoInstance.trackLink({
      href: url,
      linkType: 'link',
    })
  );
}

export function trackItemPresentation(
  category: string,
  name: string,
  value?: number
) {
  const payload = {
    category,
    name,
    action: 'Tonen',
    value,
  };
  return trackEvent(payload);
}

export function trackItemClick(category: string, name: string, value?: number) {
  return trackEvent({
    category,
    name,
    action: 'Klikken',
    value,
  });
}

/**
 * @param key A key to use for keeping track of the session variable
 * @param callback The function that gets executed after debounce is done
 * @param debounceTrigger The effect trigger for executing the debounced callback
 * @param timeoutMS How many MS should the callback be debounced
 */
export function useSessionCallbackOnceDebounced(
  key: string,
  callback: () => void,
  debounceTrigger: any = true,
  timeoutMS: number = 1000
) {
  const [isSessionTracked, setSessionTracked] = useSessionStorage(key, false);
  const [trackEvent] = useDebouncedCallback(
    () => {
      if (!isSessionTracked) {
        callback();
        setSessionTracked(true);
      }
    },
    timeoutMS,
    [debounceTrigger]
  );
  trackEvent();
}
