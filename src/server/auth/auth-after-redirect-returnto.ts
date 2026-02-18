import type { ParsedQs } from 'qs';

import { getReturnToUrlZaakStatus } from './auth-helpers';
import { authRoutes } from './auth-routes';
import { ZAAK_STATUS_ROUTE } from '../../client/pages/ZaakStatus/ZaakStatus-config';
import { generateFullApiUrlBFF } from '../routing/route-helpers';
import { routes as amsappNotificationsRoutes } from '../services/amsapp/notifications/amsapp-notifications-service-config';
import { routes as amsappStadspasRoutes } from '../services/amsapp/stadspas/amsapp-stadspas-service-config';

// Return-to-key after login for getting the administration number of the stadspas.
export const RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER =
  'amsapp-stadspas-administratienummer';
// Return-to-key after logout for redirecting to the landing page of the stadspas app.
export const RETURNTO_AMSAPP_STADSPAS_APP_LANDING = 'amsapp-stadspas-landing';

export const RETURNTO_NOTIFICATIES_CONSUMER_ID = 'notificaties-consumer-id';
// returnTo key that allow redirecting to a specific frontend route. e.g /api/v1/auth/login/digid?returnTo=mams-frontend-route&route=https://mijn.amsterdam.nl/mams-frontend-route
export const RETURNTO_MAMS_FRONTEND_ROUTE = 'mams-frontend-route';
// Mijn Amsterdam return to url config

export const RETURNTO_MAMS_LANDING_DIGID = 'mams-landing-digid';
export const RETURNTO_MAMS_LANDING_EHERKENNING = 'mams-landing-eherkenning';

export function getReturnToUrl(
  queryParams?: ParsedQs,
  defaultReturnTo?: string
) {
  let defaultReturnTo_ = defaultReturnTo;
  if (!defaultReturnTo) {
    defaultReturnTo_ = generateFullApiUrlBFF(
      authRoutes.AUTH_LOGIN_DIGID_LANDING
    );
  }
  switch (queryParams?.returnTo) {
    case RETURNTO_MAMS_FRONTEND_ROUTE: {
      const route = queryParams.route as string;
      const redirectUrl = `${process.env.MA_FRONTEND_URL}${route}`;
      return redirectUrl;
    }
    case RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER:
      return generateFullApiUrlBFF(
        amsappStadspasRoutes.public
          .STADSPAS_AMSAPP_EXCHANGE_ADMINISTRATIENUMMER,
        {
          token: queryParams['amsapp-session-token'] as string,
        }
      );
    // This return to url is used for all AmsApp routes that require Digid login/logout.
    case RETURNTO_AMSAPP_STADSPAS_APP_LANDING:
      return generateFullApiUrlBFF(
        amsappStadspasRoutes.public.STADSPAS_AMSAPP_OPENER
      );
    case RETURNTO_NOTIFICATIES_CONSUMER_ID:
      return generateFullApiUrlBFF(
        amsappNotificationsRoutes.public
          .NOTIFICATIONS_CONSUMER_REGISTRATION_ACTION,
        {
          consumerId: queryParams.consumerId as string,
        }
      );
    case ZAAK_STATUS_ROUTE:
      return getReturnToUrlZaakStatus(queryParams);
    case RETURNTO_MAMS_LANDING_EHERKENNING:
      return generateFullApiUrlBFF(authRoutes.AUTH_LOGIN_EHERKENNING_LANDING);
    case RETURNTO_MAMS_LANDING_DIGID:
      return generateFullApiUrlBFF(authRoutes.AUTH_LOGIN_DIGID_LANDING);
    default:
      return defaultReturnTo_;
  }
}
