import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';
import { apiErrorResult, getSettledResult } from '../../universal/helpers/api';
import {
  addServiceResultHandler,
  getPassthroughRequestHeaders,
  sendMessage,
  getProfileType,
  queryParams,
} from '../helpers/app';
import { fetchAFVAL, fetchAFVALPUNTEN } from './afval/afval';
import { fetchBELASTING } from './belasting';
import { fetchBRP } from './brp';
import { fetchBUURT } from './buurt';
import { fetchCMSCONTENT } from './cms-content';
import { fetchERFPACHT } from './erfpacht';
import { fetchFOCUSAanvragen } from './focus/focus-aanvragen';
import { fetchFOCUSSpecificaties } from './focus/focus-specificaties';
import { fetchFOCUSTozo } from './focus/focus-tozo';
import { fetchGenerated } from './generated';
import { fetchHOME } from './home';
import { fetchKVK } from './kvk';
import { fetchMILIEUZONE } from './milieuzone';
import { fetchTIPS, createTipsRequestData } from './tips';
import { fetchVergunningen } from './vergunningen';
import { fetchWMO } from './wmo';
import { fetchStadspas } from './focus/focus-stadspas';

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

/**
 * The service methods
 */
const BRP = callService(fetchBRP);
const CMS_CONTENT = callService(fetchCMSCONTENT);
const KVK = callService(fetchKVK);
const FOCUS_AANVRAGEN = callService(fetchFOCUSAanvragen);
const FOCUS_SPECIFICATIES = callService(fetchFOCUSSpecificaties);
const FOCUS_TOZO = callService(fetchFOCUSTozo);
const FOCUS_STADSPAS = callService(fetchStadspas);
const WMO = callService(fetchWMO);
const VERGUNNINGEN = callService(fetchVergunningen);

// Location based services
const BUURT = (sessionID: SessionID, req: Request) =>
  fetchBUURT(sessionID, getPassthroughRequestHeaders(req), getProfileType(req));

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
const services = {
  BRP,
  CMS_CONTENT,
  KVK,
  FOCUS_AANVRAGEN,
  FOCUS_SPECIFICATIES,
  FOCUS_TOZO,
  FOCUS_STADSPAS,
  WMO,
  VERGUNNINGEN,
  BUURT,
  HOME,
  AFVAL,
  AFVALPUNTEN,
  BELASTINGEN,
  MILIEUZONE,
  ERFPACHT,
  NOTIFICATIONS,
  CASES,
};

export type ServicesType = typeof services;
export type ServiceID = keyof ServicesType;
export type ServiceMap = { [key in ServiceID]: ServicesType[ServiceID] };

type PrivateServices = ServicesType;
type PrivateCommercialServices = ServicesType;

type CommercialServices = Pick<
  ServiceMap,
  | 'AFVAL'
  | 'AFVALPUNTEN'
  | 'BUURT'
  | 'CMS_CONTENT'
  | 'ERFPACHT'
  | 'NOTIFICATIONS'
  | 'CASES'
  | 'HOME'
  | 'KVK'
  | 'MILIEUZONE'
  | 'VERGUNNINGEN'
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
  private: PrivateServices;
  'private-commercial': PrivateCommercialServices;
  commercial: CommercialServices;
};

export const servicesByProfileType: ServicesByProfileType = {
  private: {
    AFVAL,
    AFVALPUNTEN,
    BRP,
    BELASTINGEN,
    BUURT,
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
    BUURT,
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
    BUURT,
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
  serviceMap:
    | PrivateServices
    | CommercialServices
    | TipsServices
    | PrivateCommercialServices,
  filterIds: SessionID[] = []
) {
  return Object.entries(serviceMap)
    .filter(([serviceID]) => !filterIds.length || filterIds.includes(serviceID))
    .map(([serviceID, fetchService]) => {
      // Return service result as Object like { SERVICE_ID: result }
      return (fetchService(sessionID, req) as Promise<any>)
        .then(result => ({
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
    responseData => {
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

  const tipsPromise = loadServicesTipsRequestData(sessionID, req);

  const serviceResults = (await Promise.all(servicePromises)).reduce(
    (acc, result, index) => Object.assign(acc, result),
    {}
  );

  const tipsResult = await tipsPromise;

  return Object.assign(serviceResults, tipsResult);
}

/**
 * TIPS specific services
 */
export type ServicesTips = ReturnTypeAsync<typeof loadServicesTipsRequestData>;

async function createTipsServiceResults(sessionID: SessionID, req: Request) {
  let requestData = null;
  if (queryParams(req).optin === 'true') {
    const servicePromises = loadServices(sessionID, req, servicesTips);
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
