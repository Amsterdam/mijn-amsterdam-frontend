import { Request, Response } from 'express';
import { getAuth } from '../../auth/auth-helpers';
import {
  sendBadRequest,
  sendResponse,
  sendUnauthorized,
} from '../../routing/route-helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';
import { fetchAfisBusinessPartnerDetails } from './afis-business-partner';
import {
  FACTUUR_STATE_KEYS,
  fetchAfisFacturenByState,
  fetchAfisFacturenOverview,
} from './afis-facturen';
import { AfisFactuurState } from './afis-types';

export async function handleFetchAfisBusinessPartner(
  req: Request<{ businessPartnerIdEncrypted: string }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    req.params.businessPartnerIdEncrypted,
    authProfileAndToken
  );

  if (decryptResult.status === 'ERROR') {
    return sendResponse(res, decryptResult);
  }

  let businessPartnerId = decryptResult.content;

  const response = await fetchAfisBusinessPartnerDetails(
    res.locals.requestID,
    businessPartnerId
  );

  return sendResponse(res, response);
}

function isPostiveInt(str: string) {
  return /^\d+$/.test(str);
}

/** Route handler to get a series of invoices (facturen) from AFIS (SAP)
 *
 *  # Optional query parameters
 *
 *  top: The maximum amount of invoices.
 *    for example `$top=4` will get you four invoices out of potentially 200.
 */
export async function handleFetchAfisFacturen(
  req: Request<{ businessPartnerIdEncrypted: string; state: AfisFactuurState }>,
  res: Response
) {
  if (!FACTUUR_STATE_KEYS.includes(req.params.state)) {
    return sendBadRequest(res, 'Unknown state param provided');
  }

  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    req.params.businessPartnerIdEncrypted,
    authProfileAndToken
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
    res.locals.requestID,
    authProfileAndToken.profile.sid,
    { state: req.params.state, businessPartnerID, top }
  );

  return sendResponse(res, response);
}

export async function handleFetchAfisFacturenOverview(
  req: Request<{ businessPartnerIdEncrypted: string }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    req.params.businessPartnerIdEncrypted,
    authProfileAndToken
  );

  if (decryptResult.status === 'ERROR') {
    return sendResponse(res, decryptResult);
  }

  const response = await fetchAfisFacturenOverview(
    res.locals.requestID,
    authProfileAndToken.profile.sid,
    { businessPartnerID: decryptResult.content }
  );

  return sendResponse(res, response);
}
