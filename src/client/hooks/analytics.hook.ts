import memoize from 'memoizee';
import { useDebouncedCallback } from 'use-debounce';
import PiwikTracker from '@amsterdam/piwik-tracker';
import {
  CustomDimension,
  TrackEventParams,
  TrackPageViewParams,
  UserOptions,
} from '@amsterdam/piwik-tracker/lib/types';
import { getOtapEnvItem } from '../../universal/config';
import { IS_ACCEPTANCE, IS_AP } from '../../universal/config/env';
import { useSessionStorage } from './storage.hook';

let PiwikInstance: PiwikTracker;

const siteId = (getOtapEnvItem('analyticsId') || -1) as unknown as number;
const hasSiteId = siteId !== -1 && !!siteId;

const PiwikTrackerConfig: UserOptions = {
  urlBase: getOtapEnvItem('analyticsUrlBase') || '',
  siteId,
};

// See dimension Ids specified on https://analytics.data.amsterdam.nl/
enum CustomDimensionId {
  ProfileType = 'user_type',
  City = 'user_city',
}

function profileTypeDimension(profileType: ProfileType) {
  return { id: CustomDimensionId.ProfileType, value: profileType as string };
}

function userCityDimension(userCity: string) {
  return { id: CustomDimensionId.City, value: userCity };
}

// Initialize connection with analytics
export function useAnalytics(isEnabled: boolean = true) {
  if (isEnabled && hasSiteId && !PiwikInstance) {
    PiwikInstance = new PiwikTracker(PiwikTrackerConfig);
  }
}

export function trackEvent(payload: TrackEventParams) {
  return PiwikInstance && PiwikInstance.trackEvent(payload);
}

export function trackSearch(keyword: string, category: string) {
  const payload = { keyword, category };
  return PiwikInstance && PiwikInstance.trackSiteSearch(payload);
}

export function trackEventWithCustomDimension(
  payload: TrackEventParams,
  profileType: ProfileType
) {
  const payloadFinal = {
    ...payload,
    customDimensions: [
      ...((payload.customDimensions as CustomDimension[]) || []),
      profileTypeDimension(profileType),
    ],
  };
  return PiwikInstance && PiwikInstance.trackEvent(payloadFinal);
}

function _trackPageView(
  title?: string,
  url?: string,
  customDimensions?: CustomDimension[]
) {
  let href = url || document.location.href;

  if (IS_AP && !href.startsWith('http')) {
    href = `https://${IS_ACCEPTANCE ? 'acc.' : ''}mijn.amsterdam.nl${href}`;
  }

  const payload: TrackPageViewParams = {
    documentTitle: title || document.title,
    href,
    customDimensions,
  };

  return PiwikInstance && PiwikInstance.trackPageView(payload);
}

export const trackPageView = memoize(_trackPageView, {
  length: 2,
  max: 1,
});

export function trackPageViewWithCustomDimension(
  title: string,
  url: string,
  profileType: ProfileType,
  userCity?: string
) {
  const dimensions = [profileTypeDimension(profileType)];
  if (userCity) {
    dimensions.push(userCityDimension(userCity));
  }
  return trackPageView(title, url, dimensions);
}

export function trackLink(url: string) {
  return (
    PiwikInstance &&
    PiwikInstance.trackLink({
      href: url,
      linkType: 'link',
    })
  );
}

export function trackItemPresentation(
  category: string,
  name: string,
  profileType: ProfileType
) {
  const payload = {
    category,
    name,
    action: 'Tonen',
  };
  return trackEventWithCustomDimension(payload, profileType);
}

export function trackItemClick(
  category: string,
  name: string,
  profileType: ProfileType
) {
  return trackEventWithCustomDimension(
    {
      category,
      name,
      action: 'Klikken',
    },
    profileType
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
