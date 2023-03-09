import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';
import { omit } from '../../universal/helpers';
import { apiErrorResult, getSettledResult } from '../../universal/helpers/api';
import {
  addServiceResultHandler,
  getAuth,
  getProfileType,
  queryParams,
  sendMessage,
} from '../helpers/app';
import { fetchAfval, fetchAfvalPunten } from './afval/afval';
import { fetchAKTES } from './aktes';
import { fetchBezwaren } from './bezwaren';
import { fetchBRP } from './brp';
import { fetchCMSCONTENT } from './cms-content';
import { fetchMaintenanceNotificationsActual } from './cms-maintenance-notifications';
import { fetchMyLocation } from './home';
import { fetchAllKlachten } from './klachten/klachten';
import { fetchKrefia } from './krefia';
import { fetchKVK } from './kvk';
import {
  fetchBelasting,
  fetchErfpacht,
  fetchMilieuzone,
  fetchSubsidie,
} from './simple-connect';
import { fetchTipsAndNotifications } from './tips-and-notifications';
import { createTipsFromServiceResults } from './tips/tips-service';
import { fetchToeristischeVerhuur } from './toeristische-verhuur';
import { fetchVergunningen } from './vergunningen/vergunningen';
import { fetchWmo } from './wmo';
import {
  fetchBbz,
  fetchBijstandsuitkering,
  fetchSpecificaties,
  fetchStadspas,
  fetchTonk,
  fetchTozo,
} from './wpi';

// Default service call just passing requestID and request headers as arguments
function callService<T>(fetchService: (...args: any) => Promise<T>) {
  return async (requestID: requestID, req: Request) =>
    fetchService(requestID, await getAuth(req), queryParams(req));
}

function callPublicService<T>(fetchService: (...args: any) => Promise<T>) {
  return (requestID: requestID, req: Request) =>
    fetchService(requestID, queryParams(req));
}

function getServiceMap(profileType: ProfileType) {
  return servicesByProfileType[profileType];
}

function getServiceTipsMap(profileType: ProfileType) {
  return (
    servicesTipsByProfileType[profileType] || servicesTipsByProfileType.private
  );
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
const BRP = callService(fetchBRP);
const AKTES = callService(fetchAKTES);
const KVK = callService(fetchKVK);
const KREFIA = callService(fetchKrefia);
const WPI_AANVRAGEN = callService(fetchBijstandsuitkering);
const WPI_SPECIFICATIES = callService(fetchSpecificaties);
const WPI_TOZO = callService(fetchTozo);
const WPI_TONK = callService(fetchTonk);
const WPI_BBZ = callService(fetchBbz);
const WPI_STADSPAS = callService(fetchStadspas);

const WMO = callService(fetchWmo);

const TOERISTISCHE_VERHUUR = async (requestID: requestID, req: Request) =>
  fetchToeristischeVerhuur(requestID, await getAuth(req), getProfileType(req));

const VERGUNNINGEN = async (requestID: requestID, req: Request) =>
  fetchVergunningen(requestID, await getAuth(req));

// Location, address, based services
const MY_LOCATION = async (requestID: requestID, req: Request) =>
  fetchMyLocation(requestID, await getAuth(req), getProfileType(req));

const AFVAL = async (requestID: requestID, req: Request) =>
  fetchAfval(requestID, await getAuth(req), getProfileType(req));

const AFVALPUNTEN = async (requestID: requestID, req: Request) =>
  fetchAfvalPunten(requestID, await getAuth(req), getProfileType(req));

// Architectural pattern C. TODO: Make generic services for pattern C.
const BELASTINGEN = callService(fetchBelasting);
const MILIEUZONE = callService(fetchMilieuzone);
const ERFPACHT = callService(fetchErfpacht);
const SUBSIDIE = callService(fetchSubsidie);
const KLACHTEN = callService(fetchAllKlachten);
const BEZWAREN = callService(fetchBezwaren);

// Special services that aggeragates NOTIFICATIONS from various services
const NOTIFICATIONS = async (requestID: requestID, req: Request) =>
  (
    await fetchTipsAndNotifications(
      requestID,
      await getAuth(req),
      getProfileType(req)
    )
  ).NOTIFICATIONS;

// Store all services for type derivation
const SERVICES_INDEX = {
  BRP,
  AKTES,
  CMS_CONTENT,
  CMS_MAINTENANCE_NOTIFICATIONS,
  KVK,
  KREFIA,
  WPI_AANVRAGEN,
  WPI_SPECIFICATIES,
  WPI_TOZO,
  WPI_TONK,
  WPI_BBZ,
  WPI_STADSPAS,
  WMO,
  VERGUNNINGEN,
  MY_LOCATION,
  AFVAL,
  AFVALPUNTEN,
  BELASTINGEN,
  MILIEUZONE,
  TOERISTISCHE_VERHUUR,
  ERFPACHT,
  SUBSIDIE,
  KLACHTEN,
  BEZWAREN,
  NOTIFICATIONS,
};

export type ServicesType = typeof SERVICES_INDEX;
export type ServiceID = keyof ServicesType;
export type ServiceMap = { [key in ServiceID]: ServicesType[ServiceID] };

type PrivateServices = ServicesType;
type PrivateCommercialServices = Omit<ServicesType, 'AKTES'>;

type CommercialServices = Pick<
  ServiceMap,
  | 'AFVAL'
  | 'AFVALPUNTEN'
  | 'CMS_CONTENT'
  | 'CMS_MAINTENANCE_NOTIFICATIONS'
  | 'ERFPACHT'
  | 'SUBSIDIE'
  | 'NOTIFICATIONS'
  | 'MY_LOCATION'
  | 'KVK'
  | 'MILIEUZONE'
  | 'VERGUNNINGEN'
  | 'TOERISTISCHE_VERHUUR'
>;

type ServicesByProfileType = {
  private: PrivateServices;
  'private-commercial': PrivateCommercialServices;
  commercial: CommercialServices;
};

export const servicesByProfileType: ServicesByProfileType = {
  private: {
    AFVAL,
    AFVALPUNTEN,
    BRP,
    AKTES,
    BELASTINGEN,
    CMS_CONTENT,
    CMS_MAINTENANCE_NOTIFICATIONS,
    ERFPACHT,
    KREFIA,
    WPI_AANVRAGEN,
    WPI_SPECIFICATIES,
    WPI_TOZO,
    WPI_BBZ,
    WPI_TONK,
    WPI_STADSPAS,
    NOTIFICATIONS,
    MY_LOCATION,
    KVK,
    MILIEUZONE,
    TOERISTISCHE_VERHUUR,
    SUBSIDIE,
    VERGUNNINGEN,
    WMO,
    KLACHTEN,
    BEZWAREN,
  },
  'private-commercial': {
    AFVAL,
    AFVALPUNTEN,
    BRP,
    BELASTINGEN,
    CMS_CONTENT,
    CMS_MAINTENANCE_NOTIFICATIONS,
    ERFPACHT,
    KREFIA,
    WPI_AANVRAGEN,
    WPI_SPECIFICATIES,
    WPI_TOZO,
    WPI_TONK,
    WPI_BBZ,
    WPI_STADSPAS,
    NOTIFICATIONS,
    MY_LOCATION,
    KVK,
    MILIEUZONE,
    TOERISTISCHE_VERHUUR,
    SUBSIDIE,
    VERGUNNINGEN,
    WMO,
    KLACHTEN,
    BEZWAREN,
  },
  commercial: {
    AFVAL,
    AFVALPUNTEN,
    CMS_CONTENT,
    CMS_MAINTENANCE_NOTIFICATIONS,
    ERFPACHT,
    NOTIFICATIONS,
    MY_LOCATION,
    KVK,
    MILIEUZONE,
    TOERISTISCHE_VERHUUR,
    SUBSIDIE,
    VERGUNNINGEN,
  },
};

const tipsOmit = ['AFVAL', 'AFVALPUNTEN', 'CMS_CONTENT', 'NOTIFICATIONS'];

export const servicesTipsByProfileType = {
  private: omit(
    servicesByProfileType.private,
    tipsOmit as Array<keyof PrivateServices>
  ),
  'private-commercial': omit(
    servicesByProfileType['private-commercial'],
    tipsOmit as Array<keyof PrivateCommercialServices>
  ),
  commercial: omit(
    servicesByProfileType.commercial,
    tipsOmit as Array<keyof CommercialServices>
  ),
};

function loadServices(
  requestID: requestID,
  req: Request,
  serviceMap: PrivateServices | CommercialServices | PrivateCommercialServices,
  filterIds: requestID[] = []
) {
  return Object.entries(serviceMap)
    .filter(([serviceID]) => !filterIds.length || filterIds.includes(serviceID))
    .map(([serviceID, fetchService]) => {
      // Return service result as Object like { SERVICE_ID: result }
      return (fetchService(requestID, req) as Promise<any>)
        .then((result) => ({
          [serviceID]: result,
        }))
        .catch((error: Error) => {
          Sentry.captureException(error);
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
  const profileType = getProfileType(req);
  const requestedServiceIds = (queryParams(req).serviceIds ||
    []) as ServiceID[];

  // Determine the services to be loaded for certain profile types
  const serviceMap = getServiceMap(profileType);
  const serviceIds = Object.keys(serviceMap);
  const servicePromises = loadServices(
    requestID,
    req,
    serviceMap,
    requestedServiceIds
  );

  // Add result handler that sends the service result via the EventSource stream
  servicePromises.forEach((servicePromise, index) =>
    addServiceResultHandler(res, servicePromise, serviceIds[index])
  );

  // Send service results to tips api for personalized tips
  const tipsPromise = getTipsFromServiceResults(requestID, req).then(
    (responseData) => {
      return { TIPS: responseData };
    }
  );

  addServiceResultHandler(res, tipsPromise, 'TIPS');

  // Close the connection when all services responded
  return Promise.allSettled([...servicePromises, tipsPromise]).then(() => {
    sendMessage(res, 'close', 'message', 'close');
    return res.end();
  });
}

export async function loadServicesAll(req: Request, res: Response) {
  const requestID = res.locals.requestID;
  const profileType = getProfileType(req);
  const requestedServiceIds = (queryParams(req).serviceIds ||
    []) as ServiceID[];
  const serviceMap = getServiceMap(profileType);
  const servicePromises = loadServices(
    requestID,
    req,
    serviceMap,
    requestedServiceIds
  );

  const tipsPromise = getTipsFromServiceResults(requestID, req).then(
    (responseData) => {
      return {
        TIPS: responseData,
      };
    }
  );

  // Combine all results into 1 object
  const serviceResults = (await Promise.all(servicePromises)).reduce(
    (acc, result, index) => Object.assign(acc, result),
    {}
  );

  const tipsResult = await tipsPromise;

  // Add tips result to final result
  return Object.assign(serviceResults, tipsResult);
}

/**
 * TIPS specific services
 */
export type ServicesTips = ReturnTypeAsync<typeof getTipsFromServiceResults>;

export async function getServiceResultsForTips(
  requestID: requestID,
  req: Request
) {
  let requestData = null;

  const profileType = queryParams(req).profileType as ProfileType;
  const servicePromises = loadServices(
    requestID,
    req,
    getServiceTipsMap(profileType) as any
  );
  requestData = (await Promise.allSettled(servicePromises)).reduce(
    (acc, result, index) => Object.assign(acc, getSettledResult(result)),
    {}
  );

  return requestData;
}

export async function getTipsFromServiceResults(
  requestID: requestID,
  req: Request
) {
  const serviceResults = await getServiceResultsForTips(requestID, req);
  const tipsDirectlyFromServices =
    (
      await fetchTipsAndNotifications(
        requestID,
        await getAuth(req),
        getProfileType(req)
      )
    ).TIPS.content ?? [];

  try {
    return createTipsFromServiceResults(queryParams(req), {
      serviceResults,
      tipsDirectlyFromServices,
    });
  } catch (error: unknown) {
    Sentry.captureException(error);
    return apiErrorResult(
      `Could not load TIPS, error: ${(error as Error).message}`,
      null
    );
  }
}

export async function loadServicesTips(req: Request, res: Response) {
  const requestID = res.locals.requestID;
  const result = await getTipsFromServiceResults(requestID, req);

  return res.json(result);
}
