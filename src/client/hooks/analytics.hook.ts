import PiwikTracker from '@amsterdam/piwik-tracker';
import {
  CustomDimension,
  TrackPageViewParams,
  UserOptions,
} from '@amsterdam/piwik-tracker/lib/types';
import memoize from 'memoizee';

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

// See dimension Ids specified in aansluitgids MIJN-5416
enum CustomDimensionId {
  ProfileType = 'user_type',
  City = 'user_city',
  Thema = 'content_theme',
}

function profileTypeDimension(profileType: ProfileType) {
  return { id: CustomDimensionId.ProfileType, value: profileType as string };
}

// Initialize connection with analytics
export function useAnalytics(isEnabled: boolean = true) {
  if (isEnabled && hasSiteId && !PiwikInstance) {
    PiwikInstance = new PiwikTracker(PiwikTrackerConfig);
  }
}

function _trackPageView(href: string, customDimensions?: CustomDimension[]) {
  const payload: TrackPageViewParams = {
    href: `/mijn-amsterdam${href}`,
    customDimensions,
  };

  return PiwikInstance && PiwikInstance.trackPageView(payload);
}

// Prevents double pageviews.
export const trackPageView = memoize(_trackPageView, {
  length: 1,
  max: 1,
});

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
  profileType: ProfileType
) {
  return (
    PiwikInstance &&
    PiwikInstance.trackDownload({
      downloadDescription,
      fileType,
      downloadUrl,
      customDimensions: [profileTypeDimension(profileType)],
    })
  );
}
