import { Response, Request } from 'express';

import { fetchAfisBusinessPartnerDetails } from './afis-business-partner';
import {
  fetchAfisEMandates,
  fetchEmandateRedirectUrlFromProvider,
  fetchEmandateSignRequestStatus,
} from './afis-e-mandates';
import { FACTUUR_STATE_KEYS, fetchAfisFacturenByState } from './afis-facturen';
import { AfisFactuurState, EMandateTransactionKey } from './afis-types';
import { getAuth } from '../../auth/auth-helpers';
import {
  RequestWithQueryParams,
  RequestWithRouteAndQueryParams,
  sendBadRequest,
  sendResponse,
  sendUnauthorized,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

export async function handleFetchAfisBusinessPartner(
  req: RequestWithQueryParams<{ id: string }>,
  res: ResponseAuthenticated
) {
  const authProfileAndToken = getAuth(req as Request);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    req.query.id,
    res.locals.authProfileAndToken
  );

  if (decryptResult.status === 'ERROR') {
    return sendResponse(res, decryptResult);
  }

  const businessPartnerId = decryptResult.content;

  const response = await fetchAfisBusinessPartnerDetails(businessPartnerId);

  return sendResponse(res, response);
}

function isPostiveInt(str: string) {
  return /^\d+$/.test(str);
}

/** Route handler to get a series of invoices (facturen) from AFIS (SAP)
 *
 *  # Optional query parameters
 *
 *  top: The maximum number of invoices.
 *    for example `$top=4` will get you four invoices out of potentially 200.
 */
export async function handleFetchAfisFacturen(
  req: RequestWithRouteAndQueryParams<
    {
      state: AfisFactuurState;
    },
    { id: string; top?: string }
  >,
  res: ResponseAuthenticated
) {
  if (!FACTUUR_STATE_KEYS.includes(req.params.state)) {
    return sendBadRequest(res, 'Unknown state param provided');
  }

  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    req.query.id,
    res.locals.authProfileAndToken
  );

  if (decryptResult.status === 'ERROR') {
    return sendResponse(res, decryptResult);
  }

  const businessPartnerID = decryptResult.content;
  let top = req.query.top;
  if (typeof top !== 'string' || !isPostiveInt(top)) {
    top = undefined;
  }

  const response = await fetchAfisFacturenByState(
    res.locals.authProfileAndToken.profile.sid,
    { state: req.params.state, businessPartnerID, top }
  );

  return sendResponse(res, response);
}

export async function handleFetchAfisEMandates(
  req: RequestWithQueryParams<{ id: string }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req as Request);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    req.query.id,
    authProfileAndToken
  );

  if (decryptResult.status === 'ERROR') {
    return sendResponse(res, decryptResult);
  }

  const businessPartnerId = decryptResult.content;

  const response = await fetchAfisEMandates(
    res.locals.requestID,
    businessPartnerId
  );

  return sendResponse(res, response);
}
// Returns a redirect URL to the eMandate provider.
export async function handleEMandateSignRequest(
  req: RequestWithRouteAndQueryParams<{ transactionKeyEncrypted: string }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const decryptResult =
    decryptEncryptedRouteParamAndValidateSessionID<EMandateTransactionKey>(
      req.query.transactionKeyEncrypted,
      authProfileAndToken
    );

  if (decryptResult.status === 'ERROR') {
    return sendResponse(res, decryptResult);
  }

  const transactionKey = decryptResult.content;

  const eMandateSignRequestResponse =
    await fetchEmandateRedirectUrlFromProvider(
      res.locals.requestID,
      transactionKey
    );

  return sendResponse(res, eMandateSignRequestResponse);
}

// Fetches the status of an eMandate sign request.
export async function handleEMandateSignRequestStatus(
  req: RequestWithRouteAndQueryParams<{ transactionKeyEncrypted: string }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const decryptResult =
    decryptEncryptedRouteParamAndValidateSessionID<EMandateTransactionKey>(
      req.query.transactionKeyEncrypted,
      authProfileAndToken
    );

  if (decryptResult.status === 'ERROR') {
    return sendResponse(res, decryptResult);
  }

  const transactionKey = decryptResult.content;

  const signRequestStatusResponse = fetchEmandateSignRequestStatus(
    res.locals.requestID,
    transactionKey
  );

  return signRequestStatusResponse;
}
