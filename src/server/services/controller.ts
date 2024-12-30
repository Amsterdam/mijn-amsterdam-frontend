import { Request, Response } from 'express';

import { streamEndpointQueryParamKeys } from '../../universal/config/app';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import {
  apiErrorResult,
  apiSuccessResult,
  getSettledResult,
} from '../../universal/helpers/api';
import { omit } from '../../universal/helpers/utils';
import { MyNotification } from '../../universal/types';
import { getAuth } from '../auth/auth-helpers';
import { AuthProfileAndToken } from '../auth/auth-types';
import { IS_DEBUG } from '../config/app';
import { queryParams, sendMessage } from '../routing/route-helpers';
import { fetchIsKnownInAFIS } from './afis/afis';
import { fetchAfval, fetchAfvalPunten } from './afval/afval';
import { fetchAVG } from './avg/avg';
import { fetchBezwaren } from './bezwaren/bezwaren';
import { fetchLoodmetingen } from './bodem/loodmetingen';
import { fetchBRP } from './brp';
import { fetchCMSCONTENT } from './cms-content';
import { fetchMaintenanceNotificationsActual } from './cms-maintenance-notifications';
import { fetchHLI } from './hli/hli';
import { fetchMyLocation } from './home';
import { fetchHorecaVergunningen } from './horeca';
import { fetchAllKlachten } from './klachten/klachten';
import { fetchKrefia } from './krefia';
import { fetchKVK } from './kvk';
import { captureException } from './monitoring';
import { fetchSSOParkerenURL } from './parkeren/parkeren';
import { fetchProfile } from './profile';
import { fetchContactmomenten } from './salesforce/contactmomenten';
import {
  fetchBelasting,
  fetchMilieuzone,
  fetchOvertredingen,
  fetchSubsidie,
} from './simple-connect';
import { fetchErfpacht, fetchErfpachtV2 } from './simple-connect/erfpacht';
import { fetchSVWI } from './simple-connect/svwi';
import {
  convertTipToNotication,
  createTipsFromServiceResults,
  prefixTipNotification,
} from './tips/tips-service';
import {
  fetchTipsAndNotifications,
  sortNotifications,
} from './tips-and-notifications';
import { fetchToeristischeVerhuur } from './toeristische-verhuur/toeristische-verhuur';
import { fetchVergunningen } from './vergunningen/vergunningen';
import { fetchVergunningenV2 } from './vergunningen-v2/vergunningen';
import { fetchWmo } from './wmo/wmo';
import {
  fetchBbz,
  fetchBijstandsuitkering,
  fetchSpecificaties,
  fetchTonk,
  fetchTozo,
} from './wpi';
import { HTTP_STATUS_CODES } from '../../universal/constants/errorCodes';

// Default service call just passing requestID and query params as arguments
function callAuthenticatedService<T>(
  fetchService: (
    requestID: RequestID,
    authProfileAndToken: AuthProfileAndToken,
    ...args: any[]
  ) => Promise<T>
) {
  return async (requestID: RequestID, req: Request) => {
    const authProfileAndToken = getAuth(req);
    if (!authProfileAndToken) {
      return apiErrorResult('Not authorized', null);
    }
    return fetchService(requestID, authProfileAndToken);
  };
}

function callPublicService<T>(fetchService: (...args: any) => Promise<T>) {
  return async (requestID: RequestID, req: Request) =>
    fetchService(requestID, queryParams(req));
}

function getServiceMap(profileType: ProfileType) {
  return servicesByProfileType[profileType];
}

function getServiceTipsMap(profileType: ProfileType) {
  return servicesTipsByProfileType[profileType] ?? {};
}

export function addServiceResultHandler(
  res: Response,
  servicePromise: Promise<any>,
  serviceName: string
) {
  if (IS_DEBUG) {
    console.log(
      'Service-controller: adding service result handler for ',
      serviceName
    );
  }
  return servicePromise.then((data) => {
    sendMessage(res, serviceName, 'message', data);
    if (IS_DEBUG) {
      console.log(
        'Service-controller: service result message sent for',
        serviceName
      );
    }
    return data;
  });
}

/**
 * The service methods
 */
// Public services
const CMS_CONTENT = callPublicService(fetchCMSCONTENT);
const CMS_MAINTENANCE_NOTIFICATIONS = callPublicService(
  fetchMaintenanceNotificationsActual
);
// Protected services
const AFIS = callAuthenticatedService(fetchIsKnownInAFIS);
const BRP = callAuthenticatedService(fetchBRP);
const HLI = callAuthenticatedService(fetchHLI);
const KREFIA = callAuthenticatedService(fetchKrefia);
const KVK = callAuthenticatedService(fetchKVK);
const PARKEREN = callAuthenticatedService(fetchSSOParkerenURL);
const SVWI = callAuthenticatedService(fetchSVWI);
const WPI_AANVRAGEN = callAuthenticatedService(fetchBijstandsuitkering);
const WPI_BBZ = callAuthenticatedService(fetchBbz);
const WPI_SPECIFICATIES = callAuthenticatedService(fetchSpecificaties);
const WPI_TONK = callAuthenticatedService(fetchTonk);
const WPI_TOZO = callAuthenticatedService(fetchTozo);
const WMO = callAuthenticatedService(fetchWmo);
const TOERISTISCHE_VERHUUR = callAuthenticatedService(fetchToeristischeVerhuur);
const VERGUNNINGEN = callAuthenticatedService(fetchVergunningen);
const VERGUNNINGENv2 = callAuthenticatedService(fetchVergunningenV2);
const HORECA = callAuthenticatedService(fetchHorecaVergunningen);
// Location, address, based services
const MY_LOCATION = callAuthenticatedService(fetchMyLocation);
const AFVAL = callAuthenticatedService(fetchAfval);
const AFVALPUNTEN = callAuthenticatedService(fetchAfvalPunten);
// Architectural pattern C. TODO: Make generic services for pattern C.
const BELASTINGEN = callAuthenticatedService(fetchBelasting);
const MILIEUZONE = callAuthenticatedService(fetchMilieuzone);
const OVERTREDINGEN = callAuthenticatedService(fetchOvertredingen);
const ERFPACHT = callAuthenticatedService(fetchErfpacht);
const ERFPACHTv2 = callAuthenticatedService(fetchErfpachtV2);
const SUBSIDIE = callAuthenticatedService(fetchSubsidie);
const KLACHTEN = callAuthenticatedService(fetchAllKlachten);
const BEZWAREN = callAuthenticatedService(fetchBezwaren);
const PROFILE = callAuthenticatedService(fetchProfile);
const AVG = callAuthenticatedService(fetchAVG);
const BODEM = callAuthenticatedService(fetchLoodmetingen); // For now bodem only consists of loodmetingen.
const SALESFORCE = callAuthenticatedService(fetchContactmomenten); // For now salesforcre only consists of contactmomenten.

// Special services that aggregates NOTIFICATIONS from various services
export const NOTIFICATIONS = async (requestID: RequestID, req: Request) => {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return apiErrorResult(
      'Not authorized',
      null,
      HTTP_STATUS_CODES.UNAUTHORIZED
    );
  }

  const [tipNotifications, themaAndTipNotifications] = await Promise.all([
    getTipNotifications(requestID, req),
    fetchTipsAndNotifications(requestID, authProfileAndToken),
  ]);

  const notifications: Array<MyNotification> = [
    ...tipNotifications,
    ...themaAndTipNotifications,
  ].map((notification) => {
    if (notification.isTip) {
      notification.hideDatePublished = true;
      return prefixTipNotification(notification);
    }
    return notification;
  });

  const notificationsWithTipsInserted = sortNotifications(notifications);

  return apiSuccessResult(notificationsWithTipsInserted);
};

// Store all services for type derivation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SERVICES_INDEX = {
  AFIS,
  AFVAL,
  AFVALPUNTEN,
  AVG,
  BELASTINGEN,
  BEZWAREN,
  BODEM,
  BRP,
  CMS_CONTENT,
  CMS_MAINTENANCE_NOTIFICATIONS,
  ERFPACHT,
  ERFPACHTv2,
  HLI,
  HORECA,
  KLACHTEN,
  KREFIA,
  KVK,
  MILIEUZONE,
  MY_LOCATION,
  NOTIFICATIONS,
  OVERTREDINGEN,
  PARKEREN,
  PROFILE,
  SUBSIDIE,
  SVWI,
  SALESFORCE,
  TOERISTISCHE_VERHUUR,
  VERGUNNINGEN,
  VERGUNNINGENv2,
  WMO,
  WPI_AANVRAGEN,
  WPI_BBZ,
  WPI_SPECIFICATIES,
  WPI_TONK,
  WPI_TOZO,
};

export type ServicesType = typeof SERVICES_INDEX;
export type ServiceID = keyof ServicesType;
export type ServiceMap = { [key in ServiceID]: ServicesType[ServiceID] };

type PrivateServices = Omit<ServicesType, 'PROFILE'>;

type PrivateServicesAttributeBased = Pick<
  ServiceMap,
  'CMS_CONTENT' | 'CMS_MAINTENANCE_NOTIFICATIONS' | 'NOTIFICATIONS' | 'PROFILE'
>;

type CommercialServices = Pick<
  ServiceMap,
  | 'AFIS'
  | 'AFVAL'
  | 'AFVALPUNTEN'
  | 'BEZWAREN'
  | 'BODEM'
  | 'CMS_CONTENT'
  | 'CMS_MAINTENANCE_NOTIFICATIONS'
  | 'ERFPACHT'
  | 'ERFPACHTv2'
  | 'HORECA'
  | 'KVK'
  | 'MILIEUZONE'
  | 'MY_LOCATION'
  | 'NOTIFICATIONS'
  | 'OVERTREDINGEN'
  | 'PARKEREN'
  | 'SUBSIDIE'
  | 'TOERISTISCHE_VERHUUR'
  | 'VERGUNNINGEN'
  | 'VERGUNNINGENv2'
>;

type ServicesByProfileType = {
  private: PrivateServices;
  'private-attributes': PrivateServicesAttributeBased;
  commercial: CommercialServices;
};

export const servicesByProfileType: ServicesByProfileType = {
  private: {
    AFIS,
    AFVAL,
    AFVALPUNTEN,
    AVG,
    BELASTINGEN,
    BEZWAREN,
    BODEM,
    BRP,
    CMS_CONTENT,
    CMS_MAINTENANCE_NOTIFICATIONS,
    ERFPACHT,
    ERFPACHTv2,
    HLI,
    HORECA,
    KLACHTEN,
    KREFIA,
    KVK,
    MILIEUZONE,
    MY_LOCATION,
    NOTIFICATIONS,
    OVERTREDINGEN,
    PARKEREN,
    SALESFORCE,
    SUBSIDIE,
    SVWI,
    TOERISTISCHE_VERHUUR,
    VERGUNNINGEN,
    VERGUNNINGENv2,
    WMO,
    WPI_AANVRAGEN,
    WPI_BBZ,
    WPI_SPECIFICATIES,
    WPI_TONK,
    WPI_TOZO,
  },
  'private-attributes': {
    CMS_CONTENT,
    CMS_MAINTENANCE_NOTIFICATIONS,
    NOTIFICATIONS,
    PROFILE,
  },
  commercial: {
    AFIS,
    AFVAL,
    AFVALPUNTEN,
    BEZWAREN,
    BODEM,
    CMS_CONTENT,
    CMS_MAINTENANCE_NOTIFICATIONS,
    ERFPACHT,
    ERFPACHTv2,
    HORECA,
    KVK,
    MILIEUZONE,
    MY_LOCATION,
    NOTIFICATIONS,
    OVERTREDINGEN,
    PARKEREN,
    SUBSIDIE,
    TOERISTISCHE_VERHUUR,
    VERGUNNINGEN,
    VERGUNNINGENv2,
  },
};

const tipsOmit = [
  'AFVAL',
  'AFVALPUNTEN',
  'CMS_CONTENT',
  'NOTIFICATIONS',
  'SALESFORCE',
];

export const servicesTipsByProfileType = {
  private: omit(
    servicesByProfileType.private,
    tipsOmit as Array<keyof PrivateServices>
  ),
  'private-attributes': {},
  commercial: omit(
    servicesByProfileType.commercial,
    tipsOmit as Array<keyof CommercialServices>
  ),
};

export function loadServices(
  requestID: RequestID,
  req: Request,
  serviceMap:
    | PrivateServices
    | CommercialServices
    | PrivateServicesAttributeBased
) {
  return Object.entries(serviceMap).map(([serviceID, fetchService]) => {
    // Return service result as Object like { SERVICE_ID: result }
    return (fetchService(requestID, req) as Promise<any>)
      .then((result) => ({
        [serviceID]: result,
      }))
      .catch((error: Error) => {
        captureException(error);
        return {
          [serviceID]: apiErrorResult(
            `Could not load ${serviceID}, error: ${error.message}`,
            null
          ),
        };
      });
  });
}

export async function loadServicesSSE(req: Request, res: Response) {
  const requestID = res.locals.requestID;
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    sendMessage(res, 'close', 'message', 'close');
    return res.end();
  }

  const profileType = authProfileAndToken?.profile.profileType;

  // Determine the services to be loaded for certain profile types
  const serviceMap = getServiceMap(profileType);
  const serviceIds = Object.keys(serviceMap);
  const servicePromises = loadServices(requestID, req, serviceMap);

  // Add result handler that sends the service result via the EventSource stream
  servicePromises.forEach((servicePromise, index) =>
    addServiceResultHandler(res, servicePromise, serviceIds[index])
  );

  // Close the connection when all services responded
  return Promise.allSettled(servicePromises).then(() => {
    sendMessage(res, 'close', 'message', 'close');
    return res.end();
  });
}

export async function loadServicesAll(req: Request, res: Response) {
  const requestID = res.locals.requestID;
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return Promise.reject(null);
  }

  const serviceMap = getServiceMap(authProfileAndToken.profile.profileType);
  const servicePromises = loadServices(requestID, req, serviceMap);

  // Combine all results into 1 object
  const serviceResults = (await Promise.all(servicePromises)).reduce(
    (acc, result) => Object.assign(acc, result),
    {}
  );

  return serviceResults;
}

/**
 * TIPS specific services
 */
export async function getServiceResultsForTips(
  requestID: RequestID,
  req: Request
) {
  let requestData = null;

  const auth = getAuth(req);

  if (auth) {
    const servicePromises = loadServices(
      requestID,
      req,
      getServiceTipsMap(auth.profile.profileType) as any
    );
    requestData = (await Promise.allSettled(servicePromises)).reduce(
      (acc, result, index) => Object.assign(acc, getSettledResult(result)),
      {}
    );
  }

  return requestData;
}

export async function getTipNotifications(
  requestID: RequestID,
  req: Request
): Promise<MyNotification[]> {
  const serviceResults = await getServiceResultsForTips(requestID, req);
  const authProfileAndToken = getAuth(req);

  if (authProfileAndToken) {
    const { content: tipNotifications } = await createTipsFromServiceResults(
      authProfileAndToken.profile.profileType,
      {
        serviceResults,
        tipsDirectlyFromServices: [],
        compareDate:
          FeatureToggle.passQueryParamsToStreamUrl &&
          req.query?.[streamEndpointQueryParamKeys.tipsCompareDate]
            ? new Date(
                req.query[
                  streamEndpointQueryParamKeys.tipsCompareDate
                ] as string
              )
            : new Date(),
      }
    );

    return tipNotifications.map(convertTipToNotication);
  }

  return [];
}
