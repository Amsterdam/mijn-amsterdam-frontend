import { Request, Response } from 'express';

import {
  apiErrorResult,
  ApiResponse_DEPRECATED,
  apiSuccessResult,
  getSettledResult,
} from '../../universal/helpers/api';
import { omit } from '../../universal/helpers/utils';
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
import { fetchHorecaVergunningen } from './horeca/horeca';
import { fetchAllKlachten } from './klachten/klachten';
import { fetchKrefia } from './krefia';
import { fetchKVK } from './kvk';
import { captureException } from './monitoring';
import { fetchMyLocation } from './my-locations';
import { fetchParkeren } from './parkeren/parkeren';
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
import { fetchNotificationsWithTipsInserted } from './tips-and-notifications';
import { fetchToeristischeVerhuur } from './toeristische-verhuur/toeristische-verhuur';
import { fetchVaren } from './varen/varen';
import { fetchVergunningenV2 } from './vergunningen-v2/vergunningen';
import { fetchWmo } from './wmo/wmo';
import {
  fetchBbz,
  fetchBijstandsuitkering,
  fetchSpecificaties,
  fetchTonk,
  fetchTozo,
} from './wpi';
import { logger } from '../logging';

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

export function addServiceResultHandler<
  T extends Promise<Record<string, ApiResponse_DEPRECATED<unknown | null>>>,
>(res: Response, servicePromise: T, serviceName: string) {
  logger.trace(
    `Service-controller: adding service result handler for ${serviceName}`
  );
  return servicePromise.then((serviceResponse) => {
    const [apiResponse] = Object.values(serviceResponse ?? {});
    if (
      apiResponse !== null &&
      typeof apiResponse === 'object' &&
      'status' in apiResponse &&
      apiResponse.status !== 'POSTPONE'
    ) {
      sendMessage(res, serviceName, 'message', serviceResponse);
    }
    logger.trace(
      `Service-controller: service result message sent for ${serviceName}`
    );
    return serviceResponse;
  });
}

/**
 * The service methods
 */
// Public services
const CMS_CONTENT = (requestID: RequestID, req: Request) => {
  const auth = getAuth(req);
  return fetchCMSCONTENT(requestID, {
    profileType: auth?.profile.profileType,
    ...queryParams(req),
  });
};
const CMS_MAINTENANCE_NOTIFICATIONS = callPublicService(
  fetchMaintenanceNotificationsActual
);

// Protected services
const AFIS = callAuthenticatedService(fetchIsKnownInAFIS);
const AVG = callAuthenticatedService(fetchAVG);
const BEZWAREN = callAuthenticatedService(fetchBezwaren);
const BODEM = callAuthenticatedService(fetchLoodmetingen); // For now bodem only consists of loodmetingen.
const BRP = callAuthenticatedService(fetchBRP);
const ERFPACHTv2 = callAuthenticatedService(fetchErfpachtV2);
const HLI = callAuthenticatedService(fetchHLI);
const HORECA = callAuthenticatedService(fetchHorecaVergunningen);
const KLACHTEN = callAuthenticatedService(fetchAllKlachten);
const KREFIA = callAuthenticatedService(fetchKrefia);
const KVK = callAuthenticatedService(fetchKVK);
const PARKEREN = callAuthenticatedService(fetchParkeren);
const PROFILE = callAuthenticatedService(fetchProfile);
const SVWI = callAuthenticatedService(fetchSVWI);
const TOERISTISCHE_VERHUUR = callAuthenticatedService(fetchToeristischeVerhuur);
const VAREN = callAuthenticatedService(fetchVaren);
const VERGUNNINGENv2 = callAuthenticatedService(fetchVergunningenV2);
const WMO = callAuthenticatedService(fetchWmo);
const WPI_AANVRAGEN = callAuthenticatedService(fetchBijstandsuitkering);
const WPI_BBZ = callAuthenticatedService(fetchBbz);
const WPI_SPECIFICATIES = callAuthenticatedService(fetchSpecificaties);
const WPI_TONK = callAuthenticatedService(fetchTonk);
const WPI_TOZO = callAuthenticatedService(fetchTozo);

// Architectural pattern C. TODO: Make generic services for pattern C.
const BELASTINGEN = callAuthenticatedService(fetchBelasting);
const MILIEUZONE = callAuthenticatedService(fetchMilieuzone);
const OVERTREDINGEN = callAuthenticatedService(fetchOvertredingen);
const ERFPACHT = callAuthenticatedService(fetchErfpacht);
const SUBSIDIE = callAuthenticatedService(fetchSubsidie);
const KLANT_CONTACT = callAuthenticatedService(fetchContactmomenten); // For now salesforcre only consists of contactmomenten.

// Location, address, based services
const AFVAL = callAuthenticatedService(fetchAfval);
const AFVALPUNTEN = callAuthenticatedService(fetchAfvalPunten);
const MY_LOCATION = callAuthenticatedService(fetchMyLocation);

// Special services that aggregates NOTIFICATIONS from various services
export const NOTIFICATIONS = async (requestID: RequestID, req: Request) => {
  const authProfileAndToken = getAuth(req);
  const serviceResults = await getServiceResultsForTips(requestID, req);
  const notificationsWithTipsInserted =
    await fetchNotificationsWithTipsInserted(
      requestID,
      serviceResults,
      authProfileAndToken
    );
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
  KLANT_CONTACT,
  TOERISTISCHE_VERHUUR,
  VAREN,
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

type PrivateServices = Omit<ServicesType, 'PROFILE' | 'VAREN'>;

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
  | 'VAREN'
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
    KLANT_CONTACT,
    SUBSIDIE,
    SVWI,
    TOERISTISCHE_VERHUUR,
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
    VAREN,
    VERGUNNINGENv2,
  },
};

const tipsOmit = [
  'AFVAL',
  'AFVALPUNTEN',
  'CMS_CONTENT',
  'NOTIFICATIONS',
  'KLANT_CONTACT',
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
    return fetchService(requestID, req)
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
 * Services specific to TIPS
 * Retrieves service results based on profile type to generate tips.
 */
async function getServiceResultsForTips(requestID: RequestID, req: Request) {
  let requestData = null;

  const auth = getAuth(req);

  if (auth) {
    const servicePromises = loadServices(
      requestID,
      req,
      getServiceTipsMap(auth.profile.profileType) as any
    );
    requestData = (await Promise.allSettled(servicePromises)).reduce(
      (acc, result) => Object.assign(acc, getSettledResult(result)),
      {}
    );
  }

  return requestData;
}

export const forTesting = {
  CMS_CONTENT,
};
