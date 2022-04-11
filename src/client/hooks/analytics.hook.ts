import MatomoTracker from '@datapunt/matomo-tracker-js';
import {
  CustomDimension,
  TrackEventParams,
  UserOptions,
} from '@datapunt/matomo-tracker-js/lib/types';
import { useDebouncedCallback } from 'use-debounce';
import { getOtapEnvItem } from '../../universal/config';
import { IS_ACCEPTANCE, IS_AP } from '../../universal/config/env';
import { useSessionStorage } from './storage.hook';

let MatomoInstance: MatomoTracker;

const siteId = getOtapEnvItem('analyticsId') || -1;
const hasSiteId = siteId !== -1 && !!siteId;

const MatomoTrackerConfig: UserOptions = {
  urlBase: getOtapEnvItem('analyticsUrlBase') || '',
  siteId,
};

// See dimension Ids specified on https://analytics.data.amsterdam.nl/
enum CustomDimensionId {
  ProfileType = 2,
  City = 3,
}

function profileTypeDimension(profileType: ProfileType) {
  return { id: CustomDimensionId.ProfileType, value: profileType };
}

function userCityDimension(userCity: string) {
  return { id: CustomDimensionId.City, value: userCity };
}

// Initialize connection with analytics
export function useAnalytics(isEnabled: boolean = true) {
  if (isEnabled && hasSiteId && !MatomoInstance) {
    MatomoInstance = new MatomoTracker(MatomoTrackerConfig);
  }
}

export function trackEvent(payload: TrackEventParams) {
  return MatomoInstance && MatomoInstance.trackEvent(payload);
}

export function trackSearch(keyword: string, category: string) {
  const payload = { keyword, category };
  return MatomoInstance && MatomoInstance.trackSiteSearch(payload);
}

export function trackEventWithCustomDimensions(
  payload: TrackEventParams,
  profileType: ProfileType,
  userCity: string
) {
  const payloadFinal = {
    ...payload,
    customDimensions: [
      ...((payload.customDimensions as CustomDimension[]) || []),
      profileTypeDimension(profileType),
      userCityDimension(userCity),
    ],
  };
  return MatomoInstance && MatomoInstance.trackEvent(payloadFinal);
}

export function trackPageView(
  title?: string,
  url?: string,
  customDimensions?: CustomDimension[]
) {
  let href = url || document.location.href;

  if (IS_AP && !href.startsWith('http')) {
    href = `https://mijn${IS_ACCEPTANCE ? '.acc' : ''}.amsterdam.nl${href}`;
  }

  const payload = {
    documentTitle: title || document.title,
    href,
    customDimensions,
  };

  const payloadSZ = {
    url: payload.href,
    title: payload.documentTitle,
  };

  // The siteimprove tracking call
  (window as any)._sz?.push(['trackdynamic', payloadSZ]);

  return MatomoInstance && MatomoInstance.trackPageView(payload);
}

export function trackPageViewWithCustomDimensions(
  title: string,
  url: string,
  profileType: ProfileType,
  userCity: string
) {
  return trackPageView(title, url, [
    profileTypeDimension(profileType),
    userCityDimension(userCity),
  ]);
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
  profileType: ProfileType,
  userCity: string
) {
  const payload = {
    category,
    name,
    action: 'Tonen',
  };
  return trackEventWithCustomDimensions(payload, profileType, userCity);
}

export function trackItemClick(
  category: string,
  name: string,
  profileType: ProfileType,
  userCity: string
) {
  return trackEventWithCustomDimensions(
    {
      category,
      name,
      action: 'Klikken',
    },
    profileType,
    userCity
  );
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
  timeoutMS: number = 1000
) {
  const [isSessionTracked, setSessionTracked] = useSessionStorage(key, false);
  const trackEvent = useDebouncedCallback(() => {
    if (!isSessionTracked) {
      callback();
      setSessionTracked(true);
    }
  }, timeoutMS);
  trackEvent();

  return () => setSessionTracked(false);
}
