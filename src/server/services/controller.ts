import { NextFunction, Request, Response } from 'express';
import { getSettledResult } from '../../universal/helpers/api';
import {
  addServiceResultHandler,
  getPassthroughRequestHeaders,
  sendMessage,
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
import { fetchTIPS } from './tips';
import { fetchVergunningen } from './vergunningen';
import { fetchWMO } from './wmo';

const DEFAULT_PROFILE_TYPE = 'private';

function queryParams(req: Request) {
  return req.query as Record<string, string>;
}

function getProfileType(req: Request) {
  return (queryParams(req).profileType as ProfileType) || DEFAULT_PROFILE_TYPE;
}

function callService<T>(fetchService: (...args: any) => Promise<T>) {
  return (sessionID: SessionID, req: Request) =>
    fetchService(sessionID, getPassthroughRequestHeaders(req));
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
  (await fetchGenerated(sessionID, getPassthroughRequestHeaders(req)))
    .NOTIFICATIONS;

// Recent cases
const CASES = async (sessionID: SessionID, req: Request) =>
  (await fetchGenerated(sessionID, getPassthroughRequestHeaders(req))).CASES;

const services = {
  BRP,
  CMS_CONTENT,
  KVK,
  FOCUS_AANVRAGEN,
  FOCUS_SPECIFICATIES,
  FOCUS_TOZO,
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

type CommercialServices = Pick<
  ServiceMap,
  | 'AFVAL'
  | 'AFVALPUNTEN'
  | 'BELASTINGEN'
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

type PrivateCommercialServices = Pick<
  ServiceMap,
  'AFVAL' | 'AFVALPUNTEN' | 'BUURT' | 'HOME'
>;

type TipsServices = Pick<
  ServiceMap,
  | 'BELASTINGEN'
  | 'BRP'
  | 'ERFPACHT'
  | 'FOCUS_AANVRAGEN'
  | 'FOCUS_SPECIFICATIES'
  | 'FOCUS_TOZO'
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
    NOTIFICATIONS,
    CASES,
    HOME,
    KVK,
    MILIEUZONE,
    VERGUNNINGEN,
    WMO,
  },
  'private-commercial': { AFVAL, AFVALPUNTEN, BUURT, HOME },
  commercial: {
    AFVAL,
    AFVALPUNTEN,
    BELASTINGEN,
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
  HOME,
  KVK,
  MILIEUZONE,
  VERGUNNINGEN,
  WMO,
};

function getServiceMap(profileType: ProfileType) {
  return servicesByProfileType[profileType];
}

export function loadServices(
  sessionID: SessionID,
  req: Request,
  serviceMap:
    | PrivateServices
    | CommercialServices
    | TipsServices
    | PrivateCommercialServices
) {
  return Object.entries(serviceMap).map(([serviceID, fetchService]) => {
    // Return service result as Object like { SERVICE_ID: result }
    return (fetchService(sessionID, req) as Promise<any>).then(result => ({
      [serviceID]: result,
    }));
  });
}

export async function loadServicesSSE(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionID = res.locals.sessionID;
  const profileType = getProfileType(req);

  // Determine the services to be loaded for certain profile types
  const serviceMap = getServiceMap(profileType);
  const serviceIds = Object.keys(serviceMap);
  const servicePromises = loadServices(sessionID, req, serviceMap);

  // Tell the client we respond with an event stream
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });

  // Add result handler that sends the service result via the EventSource stream
  servicePromises.forEach((servicePromise, index) =>
    addServiceResultHandler(res, servicePromise, serviceIds[index])
  );

  // Send service results to tips api for personalized tips
  const tipsPromise = loadServicesTipsRequestData(sessionID, req);

  addServiceResultHandler(res, tipsPromise, 'tips');

  // Close the connection when all services responded
  Promise.allSettled(servicePromises).then(() => {
    sendMessage(res, 'close', 'close', null);
    next();
  });
}

export async function loadServicesAll(req: Request, res: Response) {
  const sessionID = res.locals.sessionID;
  const profileType = getProfileType(req);
  const serviceMap = getServiceMap(profileType);
  const servicePromises = loadServices(sessionID, req, serviceMap);

  const tipsPromise = loadServicesTipsRequestData(sessionID, req);

  const serviceResults = (await Promise.all(servicePromises)).reduce(
    (acc, result, index) => Object.assign(acc, result),
    {}
  );

  const tipsResult = await tipsPromise;

  return Object.assign(serviceResults, tipsResult);
}

export async function loadServicesTipsRequestData(
  sessionID: SessionID,
  req: Request
) {
  const servicePromises = loadServices(sessionID, req, servicesTips);
  const requestData = (await Promise.allSettled(servicePromises)).reduce(
    (acc, result, index) => Object.assign(acc, getSettledResult(result)),
    {}
  );

  return fetchTIPS(
    sessionID,
    getPassthroughRequestHeaders(req),
    req.query as Record<string, string>,
    requestData
  ).then(result => ({ TIPS: result }));
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
