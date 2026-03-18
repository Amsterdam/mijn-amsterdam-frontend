// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import PiwikTracker from '@amsterdam/piwik-tracker';
import type {
  CustomDimension,
  TrackPageViewParams,
  UserOptions,
} from '@amsterdam/piwik-tracker/lib/types.js';
import { createInstance as createPiwikInstance } from '@amsterdam/piwik-tracker-react';
import memoize from 'memoizee';

// TODO: Import type(s) from @amsterdam/piwik-tracker-react when they are available
export interface PiwikInstance {
  trackPageView: PiwikTracker.default['trackPageView'];
  trackSiteSearch: PiwikTracker.default['trackSiteSearch'];
  trackLink: PiwikTracker.default['trackLink'];
  trackDownload: PiwikTracker.default['trackDownload'];
  pushInstruction: PiwikTracker.default['pushInstruction'];
}
let PiwikInstance: PiwikInstance;

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
    PiwikInstance = createPiwikInstance(PiwikTrackerConfig);
  }
  return PiwikInstance;
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
