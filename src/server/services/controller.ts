import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';
import { omit } from '../../universal/helpers';
import { apiErrorResult, getSettledResult } from '../../universal/helpers/api';
import {
  addServiceResultHandler,
  getPassthroughRequestHeaders,
  getProfileType,
  queryParams,
  sendMessage,
} from '../helpers/app';
import { fetchAFVAL, fetchAFVALPUNTEN } from './afval/afval';
import { fetchAKTES } from './aktes';
import { fetchBELASTING } from './belasting';
import { fetchBRP } from './brp';
import { fetchCMSCONTENT } from './cms-content';
import { fetchMaintenanceNotificationsActual } from './cms-maintenance-notifications';
import { fetchERFPACHT } from './erfpacht';
import { fetchFOCUSAanvragen } from './focus/focus-aanvragen';
import { fetchFOCUSSpecificaties } from './focus/focus-specificaties';
import { fetchStadspasSaldo } from './focus/focus-stadspas';
import { fetchFOCUSTonk } from './focus/focus-tonk';
import { fetchFOCUSTozo } from './focus/focus-tozo';
import { fetchGenerated } from './generated';
import { fetchHOME } from './home';
import { fetchKVK } from './kvk';
import { fetchMILIEUZONE } from './milieuzone';
import { fetchSIA } from './sia';
import { createTipsRequestData, fetchTIPS } from './tips';
import { fetchToerisme } from './toerisme';
import { fetchVergunningen } from './vergunningen';
import { fetchWMO } from './wmo';

// Default service call just passing sessionID and request headers as arguments
function callService<T>(fetchService: (...args: any) => Promise<T>) {
  return (sessionID: SessionID, req: Request) =>
    fetchService(
      sessionID,
      getPassthroughRequestHeaders(req),
      queryParams(req)
    );
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
const BRP = callService(fetchBRP);
const AKTES = callService(fetchAKTES);
const CMS_CONTENT = callService(fetchCMSCONTENT);
const CMS_MAINTENANCE_NOTIFICATIONS = callService(
  fetchMaintenanceNotificationsActual
);
const KVK = callService(fetchKVK);
const FOCUS_AANVRAGEN = callService(fetchFOCUSAanvragen);
const FOCUS_SPECIFICATIES = callService(fetchFOCUSSpecificaties);
const FOCUS_TOZO = callService(fetchFOCUSTozo);
const FOCUS_TONK = callService(fetchFOCUSTonk);
const FOCUS_STADSPAS = callService(fetchStadspasSaldo);
const TOERISME = callService(fetchToerisme);
const WMO = callService(fetchWMO);
const VERGUNNINGEN = callService(fetchVergunningen);

// Location, address, based services
const HOME = (sessionID: SessionID, req: Request) =>
  fetchHOME(sessionID, getPassthroughRequestHeaders(req), getProfileType(req));

const AFVAL = (sessionID: SessionID, req: Request) =>
  fetchAFVAL(sessionID, getPassthroughRequestHeaders(req), getProfileType(req));

const AFVALPUNTEN = (sessionID: SessionID, req: Request) =>
  fetchAFVALPUNTEN(
    sessionID,
    getPassthroughRequestHeaders(req),
    getProfileType(req)
  );

// Architectural pattern C. TODO: Make generic services for pattern C.
const BELASTINGEN = callService(fetchBELASTING);
const MILIEUZONE = callService(fetchMILIEUZONE);
const SIA = callService(fetchSIA);
const ERFPACHT = callService(fetchERFPACHT);

// Special services that aggeragates CASES and NOTIFICATIONS from various services
const NOTIFICATIONS = async (sessionID: SessionID, req: Request) =>
  (
    await fetchGenerated(
      sessionID,
      getPassthroughRequestHeaders(req),
      getProfileType(req)
    )
  ).NOTIFICATIONS;

// Recent cases
const CASES = async (sessionID: SessionID, req: Request) =>
  (
    await fetchGenerated(
      sessionID,
      getPassthroughRequestHeaders(req),
      getProfileType(req)
    )
  ).CASES;

// Store all services for type derivation
const SERVICES_INDEX = {
  BRP,
  AKTES,
  CMS_CONTENT,
  CMS_MAINTENANCE_NOTIFICATIONS,
  KVK,
  FOCUS_AANVRAGEN,
  FOCUS_SPECIFICATIES,
  FOCUS_TOZO,
  FOCUS_TONK,
  FOCUS_STADSPAS,
  WMO,
  VERGUNNINGEN,
  HOME,
  AFVAL,
  AFVALPUNTEN,
  BELASTINGEN,
  MILIEUZONE,
  SIA,
  TOERISME,
  ERFPACHT,
  NOTIFICATIONS,
  CASES,
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
  | 'NOTIFICATIONS'
  | 'CASES'
  | 'HOME'
  | 'KVK'
  | 'MILIEUZONE'
  | 'SIA'
  | 'VERGUNNINGEN'
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
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    FOCUS_TOZO,
    FOCUS_TONK,
    FOCUS_STADSPAS,
    NOTIFICATIONS,
    CASES,
    HOME,
    KVK,
    MILIEUZONE,
    SIA,
    TOERISME,
    VERGUNNINGEN,
    WMO,
  },
  'private-commercial': {
    AFVAL,
    AFVALPUNTEN,
    BRP,
    BELASTINGEN,
    CMS_CONTENT,
    CMS_MAINTENANCE_NOTIFICATIONS,
    ERFPACHT,
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    FOCUS_TOZO,
    FOCUS_TONK,
    FOCUS_STADSPAS,
    NOTIFICATIONS,
    CASES,
    HOME,
    KVK,
    MILIEUZONE,
    SIA,
    TOERISME,
    VERGUNNINGEN,
    WMO,
  },
  commercial: {
    AFVAL,
    AFVALPUNTEN,
    CMS_CONTENT,
    CMS_MAINTENANCE_NOTIFICATIONS,
    ERFPACHT,
    NOTIFICATIONS,
    CASES,
    HOME,
    KVK,
    MILIEUZONE,
    SIA,

    VERGUNNINGEN,
  },
};

const tipsOmit = [
  'AFVAL',
  'AFVALPUNTEN',
  'CMS_CONTENT',
  'NOTIFICATIONS',
  'CASES',
];

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
  sessionID: SessionID,
  req: Request,
  serviceMap: PrivateServices | CommercialServices | PrivateCommercialServices,
  filterIds: SessionID[] = []
) {
  return Object.entries(serviceMap)
    .filter(([serviceID]) => !filterIds.length || filterIds.includes(serviceID))
    .map(([serviceID, fetchService]) => {
      // Return service result as Object like { SERVICE_ID: result }
      return (fetchService(sessionID, req) as Promise<any>)
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
  const sessionID = res.locals.sessionID;
  const profileType = getProfileType(req);
  const requestedServiceIds = (queryParams(req).serviceIds ||
    []) as ServiceID[];

  // Determine the services to be loaded for certain profile types
  const serviceMap = getServiceMap(profileType);
  const serviceIds = Object.keys(serviceMap);
  const servicePromises = loadServices(
    sessionID,
    req,
    serviceMap,
    requestedServiceIds
  );

  // Add result handler that sends the service result via the EventSource stream
  servicePromises.forEach((servicePromise, index) =>
    addServiceResultHandler(res, servicePromise, serviceIds[index])
  );

  // Send service results to tips api for personalized tips
  const tipsPromise = loadServicesTipsRequestData(sessionID, req).then(
    (responseData) => {
      return { TIPS: responseData };
    }
  );

  addServiceResultHandler(res, tipsPromise, 'TIPS');

  // Close the connection when all services responded
  return Promise.allSettled([...servicePromises, tipsPromise]).then(() => {
    sendMessage(res, 'close', 'message', 'close');
  });
}

export async function loadServicesAll(req: Request, res: Response) {
  const sessionID = res.locals.sessionID;
  const profileType = getProfileType(req);
  const requestedServiceIds = (queryParams(req).serviceIds ||
    []) as ServiceID[];
  const serviceMap = getServiceMap(profileType);
  const servicePromises = loadServices(
    sessionID,
    req,
    serviceMap,
    requestedServiceIds
  );

  const tipsPromise = loadServicesTipsRequestData(sessionID, req).then(
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
export type ServicesTips = ReturnTypeAsync<typeof loadServicesTipsRequestData>;

async function createTipsServiceResults(sessionID: SessionID, req: Request) {
  let requestData = null;
  if (queryParams(req).optin === 'true') {
    const profileType = queryParams(req).profileType as ProfileType;
    const servicePromises = loadServices(
      sessionID,
      req,
      getServiceTipsMap(profileType) as any
    );
    requestData = (await Promise.allSettled(servicePromises)).reduce(
      (acc, result, index) => Object.assign(acc, getSettledResult(result)),
      {}
    );
  }
  return requestData;
}

async function loadServicesTipsRequestData(sessionID: SessionID, req: Request) {
  const serviceResults = await createTipsServiceResults(sessionID, req);

  return fetchTIPS(
    sessionID,
    getPassthroughRequestHeaders(req),
    queryParams(req),
    serviceResults
  ).catch((error: Error) => {
    Sentry.captureException(error);
    return apiErrorResult(`Could not load TIPS, error: ${error.message}`, null);
  });
}

export async function loadServicesTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionID = res.locals.sessionID;
  const result = await loadServicesTipsRequestData(sessionID, req);
  res.json(result);
  next();
}

export async function loadServicesTipsRequestDataOverview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionID = res.locals.sessionID;
  req.query.optin = 'true';
  const result = await createTipsServiceResults(sessionID, req);
  res.json(createTipsRequestData(queryParams(req), result));
  next();
}
