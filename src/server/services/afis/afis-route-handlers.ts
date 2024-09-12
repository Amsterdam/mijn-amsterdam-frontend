import { Request, Response } from 'express';
import { getAuth, sendResponse } from '../../helpers/app';
import { decryptAndValidate } from '../shared/decrypt-route-param';
import { fetchAfisBusinessPartnerDetails, fetchAfisFacturen } from './afis';
import { AfisFactuurState } from './afis-types';

export async function handleFetchAfisBusinessPartner(
  req: Request<{ businessPartnerIdEncrypted: string }>,
  res: Response
) {
  const authProfileAndToken = await getAuth(req);

  const decryptResponse = decryptAndValidate(
    req.params.businessPartnerIdEncrypted,
    authProfileAndToken
  );

  if (decryptResponse.status === 'ERROR') {
    return sendResponse(res, decryptResponse);
  }

  let businessPartnerId = decryptResponse.content;

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
  const authProfileAndToken = await getAuth(req);
  const decryptResponse = decryptAndValidate(
    req.params.businessPartnerIdEncrypted,
    authProfileAndToken
  );

  if (decryptResponse.status === 'ERROR') {
    return sendResponse(res, decryptResponse);
  }

  const businessPartnerID = decryptResponse.content;
  let top = req.query.top;
  if (typeof top !== 'string' || !isPostiveInt(top)) {
    top = undefined;
  }

  const response = await fetchAfisFacturen(
    res.locals.requestID,
    authProfileAndToken.profile.sid,
    { state: req.params.state, businessPartnerID, top }
  );
  return sendResponse(res, response);
}
