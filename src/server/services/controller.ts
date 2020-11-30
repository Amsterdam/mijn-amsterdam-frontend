import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';
import { apiErrorResult, getSettledResult } from '../../universal/helpers/api';
import {
  addServiceResultHandler,
  getPassthroughRequestHeaders,
  sendMessage,
} from '../helpers/app';
import { fetchAFVAL, fetchAFVALPUNTEN } from './afval/afval';
import { fetchBELASTING } from './belasting';
import { fetchBRP } from './brp';
import { fetchCMSCONTENT } from './cms-content';
import { fetchERFPACHT } from './erfpacht';
import { fetchFOCUSAanvragen } from './focus/focus-aanvragen';
import { fetchFOCUSSpecificaties } from './focus/focus-specificaties';
import { fetchFOCUSTozo } from './focus/focus-tozo';
import { fetchGenerated } from './generated';
import { fetchHOME } from './home';
import { fetchKVK } from './kvk';
import { fetchMILIEUZONE } from './milieuzone';
import { fetchTIPS } from './tips';
import { fetchVergunningen } from './vergunningen';
import { fetchWMO } from './wmo';
import { fetchStadspasSaldo } from './focus/focus-stadspas';

const DEFAULT_PROFILE_TYPE = 'private';

function queryParams(req: Request) {
  return req.query as Record<string, string>;
}

function getProfileType(req: Request) {
  return (queryParams(req).profileType as ProfileType) || DEFAULT_PROFILE_TYPE;
}

// Default service call just passing sessionID and request headers as arguments
function callService<T>(fetchService: (...args: any) => Promise<T>) {
  return (sessionID: SessionID, req: Request) =>
    fetchService(sessionID, getPassthroughRequestHeaders(req), req.query);
}

function getServiceMap(profileType: ProfileType) {
  return servicesByProfileType[profileType];
}

/**
 * The service methods
 */
const BRP = callService(fetchBRP);
const CMS_CONTENT = callService(fetchCMSCONTENT);
const KVK = callService(fetchKVK);
const FOCUS_AANVRAGEN = callService(fetchFOCUSAanvragen);
const FOCUS_SPECIFICATIES = callService(fetchFOCUSSpecificaties);
const FOCUS_TOZO = callService(fetchFOCUSTozo);
const FOCUS_STADSPAS = callService(fetchStadspasSaldo);
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
const ERFPACHT = callService(fetchERFPACHT);

// Special services that aggeragates CASES and NOTIFICATIONS from various services
const NOTIFICATIONS = async (sessionID: SessionID, req: Request) =>
  (await fetchGenerated(sessionID, getPassthroughRequestHeaders(req)))
    .NOTIFICATIONS;

// Recent cases
const CASES = async (sessionID: SessionID, req: Request) =>
  (await fetchGenerated(sessionID, getPassthroughRequestHeaders(req))).CASES;

// Store all services for type derivation
const SERVICES_INDEX = {
  BRP,
  CMS_CONTENT,
  KVK,
  FOCUS_AANVRAGEN,
  FOCUS_SPECIFICATIES,
  FOCUS_TOZO,
  FOCUS_STADSPAS,
  WMO,
  VERGUNNINGEN,
  HOME,
  AFVAL,
  AFVALPUNTEN,
  BELASTINGEN,
  MILIEUZONE,
  ERFPACHT,
  NOTIFICATIONS,
  CASES,
};

export type ServicesType = typeof SERVICES_INDEX;
export type ServiceID = keyof ServicesType;
export type ServiceMap = { [key in ServiceID]: ServicesType[ServiceID] };

type CommercialServices = Omit<
  ServicesType,
  | 'BRP'
  | 'FOCUS_TOZO'
  | 'FOCUS_SPECIFICATIES'
  | 'BELASTINGEN'
  | 'FOCUS_AANVRAGEN'
  | 'FOCUS_TOZO'
  | 'FOCUS_STADSPAS'
  | 'WMO'
>;

type TipsServices = Pick<
  ServiceMap,
  | 'BELASTINGEN'
  | 'BRP'
  | 'ERFPACHT'
  | 'FOCUS_AANVRAGEN'
  | 'FOCUS_SPECIFICATIES'
  | 'FOCUS_TOZO'
  | 'FOCUS_STADSPAS'
  | 'HOME'
  | 'KVK'
  | 'MILIEUZONE'
  | 'VERGUNNINGEN'
  | 'WMO'
>;

type ServicesByProfileType = {
  private: ServicesType;
  'private-commercial': ServicesType;
  commercial: CommercialServices;
};

export const servicesByProfileType: ServicesByProfileType = {
  private: {
    AFVAL,
    AFVALPUNTEN,
    BRP,
    BELASTINGEN,
    CMS_CONTENT,
    ERFPACHT,
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    FOCUS_TOZO,
    FOCUS_STADSPAS,
    NOTIFICATIONS,
    CASES,
    HOME,
    KVK,
    MILIEUZONE,
    VERGUNNINGEN,
    WMO,
  },
  'private-commercial': {
    AFVAL,
    AFVALPUNTEN,
    BRP,
    BELASTINGEN,
    CMS_CONTENT,
    ERFPACHT,
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    FOCUS_TOZO,
    FOCUS_STADSPAS,
    NOTIFICATIONS,
    CASES,
    HOME,
    KVK,
    MILIEUZONE,
    VERGUNNINGEN,
    WMO,
  },
  commercial: {
    AFVAL,
    AFVALPUNTEN,
    CMS_CONTENT,
    ERFPACHT,
    NOTIFICATIONS,
    CASES,
    HOME,
    KVK,
    MILIEUZONE,
    VERGUNNINGEN,
  },
};

export const servicesTips: TipsServices = {
  BELASTINGEN,
  BRP,
  ERFPACHT,
  FOCUS_AANVRAGEN,
  FOCUS_SPECIFICATIES,
  FOCUS_TOZO,
  FOCUS_STADSPAS,
  HOME,
  KVK,
  MILIEUZONE,
  VERGUNNINGEN,
  WMO,
};

function loadServices(
  sessionID: SessionID,
  req: Request,
  serviceMap: CommercialServices | TipsServices | ServicesType,
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
    sendMessage(res, 'close', 'close', null);
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

// Fetches service data to send as post data for the tips api
async function loadServicesTipsRequestData(sessionID: SessionID, req: Request) {
  let requestData = null;

  if (queryParams(req).optin === 'true') {
    const servicePromises = loadServices(sessionID, req, servicesTips);
    requestData = (await Promise.allSettled(servicePromises)).reduce(
      (acc, result, index) => Object.assign(acc, getSettledResult(result)),
      {}
    );
  }

  return fetchTIPS(
    sessionID,
    getPassthroughRequestHeaders(req),
    req.query as Record<string, string>,
    requestData
  ).catch((error: Error) => {
    Sentry.captureException(error);
    return apiErrorResult(`Could not load TIPS, error: ${error.message}`, null);
  });
}

export type ServicesTips = ReturnTypeAsync<typeof loadServicesTipsRequestData>;

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
