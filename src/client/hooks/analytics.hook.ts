import type {
  CustomDimension,
  TrackPageViewParams,
  UserOptions,
  PiwikTracker,
} from '@amsterdam/piwik-tracker-react';
import {
  createInstance as createPiwikInstance,
  urlTransformers,
} from '@amsterdam/piwik-tracker-react';
import memoize from 'memoizee';

let piwikInstance: PiwikTracker;

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
  urlTransformer: urlTransformers.redactIdLikePathSegments,
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
  if (isEnabled && hasSiteId && !piwikInstance) {
    piwikInstance = createPiwikInstance(PiwikTrackerConfig);
  }
  return piwikInstance;
}

function _trackPageView(href: string, customDimensions?: CustomDimension[]) {
  const payload: TrackPageViewParams = {
    href: `/mijn-amsterdam${href}`,
    customDimensions,
  };

  return piwikInstance && piwikInstance.trackPageView(payload);
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
    piwikInstance &&
    piwikInstance.trackDownload({
      downloadDescription,
      fileType,
      downloadUrl,
      customDimensions: [profileTypeDimension(profileType)],
    })
  );
}
