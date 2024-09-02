import { Request, Response } from 'express';
import {
  fetchAfisBusinessPartnerDetails,
  fetchAfisClosedFacturen,
  fetchAfisOpenFacturen,
} from './afis';
import { send404, sendResponse, sendUnauthorized } from '../../helpers/app';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisFactuurState,
} from './afis-types';
import { decrypt } from '../../helpers/encrypt-decrypt';

type BaseParams = {
  businessPartnerIdEncrypted: string;
};

export async function handleFetchAfisBusinessPartner(
  req: Request<BaseParams>,
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

export async function handleFetchAfisFacturen(
  req: Request<BaseParams & { state: AfisFactuurState }>,
  res: Response
) {
  const handler = async (
    req: Request,
    res: Response,
    businessPartnerID: AfisBusinessPartnerDetailsTransformed['businessPartnerId']
  ) => {
    const state = req.params.state;

    switch (state) {
      case 'open': {
        // Top is a maximum of thirty. Might need to make more requests to get all the facturen.
        const response = await fetchAfisOpenFacturen(
          res.locals.requestID,
          businessPartnerID
        );
        return sendResponse(res, response);
      }
      case 'closed': {
        const maximumTopForFrontend = 3;
        const response = await fetchAfisClosedFacturen(
          res.locals.requestID,
          maximumTopForFrontend
        );
        return sendResponse(res, response);
      }
      default: {
        return send404(res);
      }
    }
  };

  return await fetchWithEncryptedBusinessPartnerID(handler, req, res);
}

async function fetchWithEncryptedBusinessPartnerID<R>(
  handleFetchFn: (
    req: Request,
    res: Response,
    businessPartnerID: AfisBusinessPartnerDetailsTransformed['businessPartnerId']
  ) => R,
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

  return await handleFetchFn(req, res, businessPartnerId);
}
