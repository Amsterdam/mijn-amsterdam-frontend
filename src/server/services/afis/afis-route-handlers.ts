import { Request, Response } from 'express';
import {
  fetchAfisBusinessPartnerDetails,
  fetchAfisFacturen,
  AfisFacturenQueryParams,
  fetchAfisDocument,
} from './afis';
import {
  AuthProfileAndToken,
  getAuth,
  send404,
  sendResponse,
  sendUnauthorized,
} from '../../helpers/app';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisFactuurState,
} from './afis-types';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { decryptAndValidate } from '../shared/decrypt-route-param';

export async function handleFetchAfisBusinessPartner(
  req: Request<{ businessPartnerIdEncrypted: string }>,
  res: Response
) {
  const handler = async (
    _req: Request,
    res: Response,
    businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId']
  ) => {
    const response = await fetchAfisBusinessPartnerDetails(businessPartnerId);

    return sendResponse(res, response);
  };

  return fetchWithEncryptedBusinessPartnerID(handler, req, res);
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
    return res.send(decryptResponse);
  }

  const businessPartnerID = decryptResponse.content;
  let top = req.query.top;
  if (typeof top !== 'string' || !isPostiveInt(top)) {
    top = undefined;
  }

  const response = await fetchAfisFacturen(
    res.locals.requestID,
    authProfileAndToken,
    { state: req.params.state, businessPartnerID, top }
  );
  return sendResponse(res, response);
}

// RP TODO: closure weghalen en terugzettetn
async function fetchWithEncryptedBusinessPartnerID<T>(
  handler: (
    req: Request,
    res: Response,
    businessPartnerID: AfisBusinessPartnerDetailsTransformed['businessPartnerId']
  ) => T,
  req: Request,
  res: Response
) {
  let businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId'];
  try {
    businessPartnerId = parseInt(
      decrypt(req.params.businessPartnerIdEncrypted),
      10
    );
  } catch (error) {
    return sendUnauthorized(res);
  }

  return await handler(req, res, businessPartnerId);
}
