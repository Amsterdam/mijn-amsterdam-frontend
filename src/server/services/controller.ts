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
import { logger } from '../logging';
import {
  queryParams,
  sendMessage,
  type RequestWithQueryParams,
} from '../routing/route-helpers';
import { fetchIsKnownInAFIS } from './afis/afis';
import { fetchAfval, fetchAfvalPunten } from './afval/afval';
import { fetchAVG } from './avg/avg';
import { fetchMyLocations } from './bag/my-locations';
import { fetchBezwaren } from './bezwaren/bezwaren';
import { fetchLoodmetingen } from './bodem/loodmetingen';
import { fetchBrp } from './brp/brp';
import { fetchMijnAmsterdamUitlegPage } from './cms/cms-content';
import { fetchActiveMaintenanceNotifications } from './cms/cms-maintenance-notifications';
import { fetchErfpacht } from './erfpacht/erfpacht';
import { fetchHLI } from './hli/hli';
import { fetchHorecaVergunningen } from './horeca/horeca';
import { fetchKVK } from './hr-kvk/hr-kvk';
import { fetchLeerlingenvervoer } from './jeugd/jeugd';
import { fetchAllKlachten } from './klachten/klachten';
import { fetchKrefia } from './krefia/krefia';
import { captureException } from './monitoring';
import { fetchParkeren } from './parkeren/parkeren';
import {
  fetchBelasting,
  fetchMilieuzone,
  fetchOvertredingen,
  fetchSubsidie,
} from './patroon-c';
import { fetchSVWI } from './patroon-c/svwi';
import { fetchContactmomenten } from './salesforce/contactmomenten';
import { fetchNotificationsWithTipsInserted } from './tips-and-notifications';
import { fetchToeristischeVerhuur } from './toeristische-verhuur/toeristische-verhuur';
import { fetchLatestUserFeedbackSurvey } from './user-feedback/user-feedback';
import { fetchVaren } from './varen/varen';
import { fetchVergunningen } from './vergunningen/vergunningen';
import { fetchWmo } from './wmo/wmo';
import {
  fetchBbz,
  fetchBijstandsuitkering,
  fetchSpecificaties,
  fetchTonk,
  fetchTozo,
} from './wpi';

// Default service call just passing query params as arguments
function callAuthenticatedService<T>(
  fetchService: (
    authProfileAndToken: AuthProfileAndToken,
    ...args: any[]
  ) => Promise<T>
) {
  return async (req: Request) => {
    const authProfileAndToken = getAuth(req);
    if (!authProfileAndToken) {
      return apiErrorResult('Not authorized', null);
    }
    return fetchService(authProfileAndToken);
  };
}

function callPublicService<T>(fetchService: (...args: any) => Promise<T>) {
  return async (req: Request) => fetchService(queryParams(req));
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
const CMS_CONTENT = (req: RequestWithQueryParams<{ renewCache?: 'true' }>) => {
  const auth = getAuth(req);
  return fetchMijnAmsterdamUitlegPage(
    auth?.profile.profileType,
    req.query.renewCache === 'true'
  );
};
const CMS_MAINTENANCE_NOTIFICATIONS = callPublicService(
  fetchActiveMaintenanceNotifications
);

// Protected services
const AFIS = callAuthenticatedService(fetchIsKnownInAFIS);
const AVG = callAuthenticatedService(fetchAVG);
const BEZWAREN = callAuthenticatedService(fetchBezwaren);
const BODEM = callAuthenticatedService(fetchLoodmetingen); // For now bodem only consists of loodmetingen.
const BRP = callAuthenticatedService(fetchBrp);
const ERFPACHT = callAuthenticatedService(fetchErfpacht);
const HLI = callAuthenticatedService(fetchHLI);
const HORECA = callAuthenticatedService(fetchHorecaVergunningen);
const KLACHTEN = callAuthenticatedService(fetchAllKlachten);
const KREFIA = callAuthenticatedService(fetchKrefia);
const KVK = callAuthenticatedService(fetchKVK);
const PARKEREN = callAuthenticatedService(fetchParkeren);
const SVWI = callAuthenticatedService(fetchSVWI);
const TOERISTISCHE_VERHUUR = callAuthenticatedService(fetchToeristischeVerhuur);
const VAREN = callAuthenticatedService(fetchVaren);
const VERGUNNINGEN = callAuthenticatedService(fetchVergunningen);
const WMO = callAuthenticatedService(fetchWmo);
const JEUGD = callAuthenticatedService(fetchLeerlingenvervoer);
const WPI_AANVRAGEN = callAuthenticatedService(fetchBijstandsuitkering);
const WPI_BBZ = callAuthenticatedService(fetchBbz);
const WPI_SPECIFICATIES = callAuthenticatedService(fetchSpecificaties);
const WPI_TONK = callAuthenticatedService(fetchTonk);
const WPI_TOZO = callAuthenticatedService(fetchTozo);
const KTO = callAuthenticatedService(() => fetchLatestUserFeedbackSurvey());

// Architectural pattern C. TODO: Make generic services for pattern C.
const BELASTINGEN = callAuthenticatedService(fetchBelasting);
const MILIEUZONE = callAuthenticatedService(fetchMilieuzone);
const OVERTREDINGEN = callAuthenticatedService(fetchOvertredingen);
const SUBSIDIES = callAuthenticatedService(fetchSubsidie);
const KLANT_CONTACT = callAuthenticatedService(fetchContactmomenten); // For now salesforcre only consists of contactmomenten.

// Location, address, based services
const AFVAL = callAuthenticatedService(fetchAfval);
const AFVALPUNTEN = callAuthenticatedService(fetchAfvalPunten);
const MY_LOCATION = callAuthenticatedService(fetchMyLocations);

// Special services that aggregates NOTIFICATIONS from various services
export const NOTIFICATIONS = async (req: Request) => {
  const authProfileAndToken = getAuth(req);
  const serviceResults = await getServiceResultsForTips(req);
  const notificationsWithTipsInserted =
    await fetchNotificationsWithTipsInserted(
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
  SUBSIDIES,
  SVWI,
  KLANT_CONTACT,
  TOERISTISCHE_VERHUUR,
  VAREN,
  VERGUNNINGEN,
  WMO,
  JEUGD,
  WPI_AANVRAGEN,
  WPI_BBZ,
  WPI_SPECIFICATIES,
  WPI_TONK,
  WPI_TOZO,
  KTO,
};

export type ServicesType = typeof SERVICES_INDEX;
export type ServiceID = keyof ServicesType;
export type ServiceMap = { [key in ServiceID]: ServicesType[ServiceID] };

type PrivateServices = Omit<ServicesType, 'VAREN'>;

type PrivateServicesAttributeBased = Pick<
  ServiceMap,
  'CMS_CONTENT' | 'CMS_MAINTENANCE_NOTIFICATIONS' | 'NOTIFICATIONS'
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
  | 'HORECA'
  | 'KVK'
  | 'MILIEUZONE'
  | 'MY_LOCATION'
  | 'NOTIFICATIONS'
  | 'OVERTREDINGEN'
  | 'PARKEREN'
  | 'SUBSIDIES'
  | 'TOERISTISCHE_VERHUUR'
  | 'VAREN'
  | 'VERGUNNINGEN'
  | 'KTO'
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
    SUBSIDIES,
    SVWI,
    TOERISTISCHE_VERHUUR,
    VERGUNNINGEN,
    WMO,
    WPI_AANVRAGEN,
    WPI_BBZ,
    WPI_SPECIFICATIES,
    WPI_TONK,
    WPI_TOZO,
    JEUGD,
    KTO,
  },
  'private-attributes': {
    CMS_CONTENT,
    CMS_MAINTENANCE_NOTIFICATIONS,
    NOTIFICATIONS,
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
    HORECA,
    KVK,
    MILIEUZONE,
    MY_LOCATION,
    NOTIFICATIONS,
    OVERTREDINGEN,
    PARKEREN,
    SUBSIDIES,
    TOERISTISCHE_VERHUUR,
    VAREN,
    VERGUNNINGEN,
    KTO,
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
  req: Request,
  serviceMap:
    | PrivateServices
    | CommercialServices
    | PrivateServicesAttributeBased
) {
  return Object.entries(serviceMap).map(([serviceID, fetchService]) => {
    // Return service result as Object like { SERVICE_ID: result }
    return fetchService(req)
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
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    sendMessage(res, 'close', 'message', 'close');
    return res.end();
  }

  const profileType = authProfileAndToken?.profile.profileType;

  // Determine the services to be loaded for certain profile types
  const serviceMap = getServiceMap(profileType);
  const serviceIds = Object.keys(serviceMap);
  const servicePromises = loadServices(req, serviceMap);

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
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return Promise.reject(null);
  }

  const serviceMap = getServiceMap(authProfileAndToken.profile.profileType);
  const servicePromises = loadServices(req, serviceMap);

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
async function getServiceResultsForTips(req: Request) {
  let requestData = null;

  const auth = getAuth(req);

  if (auth) {
    const servicePromises = loadServices(
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
  getServiceResultsForTips,
};
