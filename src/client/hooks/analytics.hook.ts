import memoize from 'memoizee';
import PiwikTracker from '@amsterdam/piwik-tracker';
import {
  CustomDimension,
  TrackPageViewParams,
  TrackSiteSearchParams,
  TrackSiteSearchResultClick,
  UserOptions,
} from '@amsterdam/piwik-tracker/lib/types';
import { getOtapEnvItem } from '../../universal/config';
import { IS_ACCEPTANCE, IS_AP } from '../../universal/config/env';

let PiwikInstance: PiwikTracker;

const siteId = (getOtapEnvItem('analyticsId') || -1) as unknown as string;
const hasSiteId = !!siteId;

const PiwikTrackerConfig: UserOptions = {
  urlBase: getOtapEnvItem('analyticsUrlBase') || '',
  siteId,
};

// See dimension Ids specified in aansluitgids MIJN-5416
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

export function trackSearch(
  keyword: string,
  count: number,
  searchMachine: string,
  profileType: ProfileType
) {
  const payload: TrackSiteSearchParams = {
    keyword,
    count,
    type: 'manueel',
    searchMachine,
    customDimensions: [profileTypeDimension(profileType)],
  };
  return PiwikInstance && PiwikInstance.trackSiteSearch(payload);
}

export function trackSearchResultClick({
  keyword,
  searchResult,
  amountOfResults,
  amountOfResultsShown,
  type,
}: TrackSiteSearchResultClick) {
  return (
    PiwikInstance &&
    PiwikInstance.trackSiteSearchResultClick({
      keyword,
      searchResult,
      amountOfResults,
      amountOfResultsShown,
      type,
    })
  );
}

function _trackPageView(url?: string, customDimensions?: CustomDimension[]) {
  let href = url || document.location.href;

  if (IS_AP && !href.startsWith('http')) {
    href = `https://${IS_ACCEPTANCE ? 'acc.' : ''}mijn.amsterdam.nl${href}`;
  }

  const payload: TrackPageViewParams = {
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
  return trackPageView(url, dimensions);
}

export function trackLink(
  url: string,
  linkTitle: string,
  customDimensions?: CustomDimension[]
) {
  return (
    PiwikInstance &&
    PiwikInstance.trackLink({
      href: url,
      linkTitle,
      customDimensions,
    })
  );
}

export function trackItemClick(
  url: string,
  linkTitle: string,
  profileType: ProfileType
) {
  return trackLink(url, linkTitle, [profileTypeDimension(profileType)]);
}
