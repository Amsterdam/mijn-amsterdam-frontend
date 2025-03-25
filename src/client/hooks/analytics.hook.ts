import PiwikTracker from '@amsterdam/piwik-tracker';
import {
  CustomDimension,
  TrackPageViewParams,
  TrackSiteSearchParams,
  TrackSiteSearchResultClick,
  UserOptions,
} from '@amsterdam/piwik-tracker/lib/types';
import memoize from 'memoizee';

import { ThemaTitles } from '../config/thema';

let PiwikInstance: PiwikTracker;

const siteId = (import.meta.env.REACT_APP_ANALYTICS_ID ||
  -1) as unknown as string;
const hasSiteId = !!siteId;

const PiwikTrackerConfig: UserOptions = {
  urlBase: 'https://dap.amsterdam.nl',
  siteId,
  nonce: 'D6251655468576D5A566B59703373367',
  heartBeat: {
    active: false,
  },
};

const DEFAULT_THEMA_VALUE = 'Mijn Amsterdam algemeen';
const MIN_SEARCH_LENGTH = 3;

// See dimension Ids specified in aansluitgids MIJN-5416
enum CustomDimensionId {
  ProfileType = 'user_type',
  City = 'user_city',
  Thema = 'content_theme',
}

function profileTypeDimension(profileType: ProfileType) {
  return { id: CustomDimensionId.ProfileType, value: profileType as string };
}

function userCityDimension(userCity: string) {
  return { id: CustomDimensionId.City, value: userCity };
}

function maThema(thema: string) {
  return { id: CustomDimensionId.Thema, value: thema };
}

export function getDerivedThemaNaamFromDocumentTitle() {
  const title = typeof document !== 'undefined' ? document.title : '';

  return (
    Object.values(ThemaTitles).find((t) => {
      return title.includes(t);
    }) ?? DEFAULT_THEMA_VALUE
  );
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
  if (keyword.length <= MIN_SEARCH_LENGTH) {
    //Only track from 4 chars and above
    return;
  }

  const payload: TrackSiteSearchParams = {
    keyword,
    count,
    type: 'autocomplete',
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
  if (keyword.length <= MIN_SEARCH_LENGTH) {
    return;
  }

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

function _trackPageView(href: string, customDimensions?: CustomDimension[]) {
  const payload: TrackPageViewParams = {
    href: `/mijn-amsterdam${href}/`,
    customDimensions,
  };

  return PiwikInstance && PiwikInstance.trackPageView(payload);
}

// Prevents double pageviews.
export const trackPageView = memoize(_trackPageView, {
  length: 1,
  max: 1,
});

export function trackPageViewWithCustomDimension(
  title: string,
  url: string,
  profileType: ProfileType,
  userCity?: string,
  thema?: string
) {
  const dimensions = [profileTypeDimension(profileType)];

  if (userCity) {
    dimensions.push(userCityDimension(userCity));
  }

  if (thema) {
    dimensions.push(maThema(thema));
  } else {
    thema = getDerivedThemaNaamFromDocumentTitle();
    dimensions.push(maThema(thema));
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

export function trackDownload(
  downloadDescription: string,
  fileType: string | undefined = 'pdf',
  downloadUrl: string,
  profileType: ProfileType,
  userCity: string
) {
  const thema = getDerivedThemaNaamFromDocumentTitle();

  return (
    PiwikInstance &&
    PiwikInstance.trackDownload({
      downloadDescription,
      fileType,
      downloadUrl,
      customDimensions: [
        profileTypeDimension(profileType),
        userCityDimension(userCity),
        maThema(thema),
      ],
    })
  );
}
