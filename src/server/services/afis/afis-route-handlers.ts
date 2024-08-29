import { Request, Response } from 'express';
import {
  fetchAfisBusinessPartnerDetails,
  fetchAfisClosedFacturen,
  fetchAfisOpenFacturen,
} from './afis';
import { sendResponse, sendUnauthorized } from '../../helpers/app';
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
  let businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId'];

  try {
    businessPartnerId = parseInt(
      decrypt(req.params.businessPartnerIdEncrypted),
      10
    );
  } catch (error) {
    return sendUnauthorized(res);
  }

  const response = await fetchAfisBusinessPartnerDetails(businessPartnerId);

  return sendResponse(res, response);
}

export async function handleFetchAfisFacturen(
  req: Request<BaseParams & { state: AfisFactuurState }>,
  res: Response
) {
  const state = req.params.state;

  // RP TODO: factor out (together with function above)
  let businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId'];

  try {
    businessPartnerId = parseInt(
      decrypt(req.params.businessPartnerIdEncrypted),
      10
    );
  } catch (error) {
    return sendUnauthorized(res);
  }

  switch (state) {
    case 'open': {
      // Top is a maximum of thirty. Might need to make more requests to get all the facturen.
      const response = await fetchAfisOpenFacturen(
        res.locals.requestID,
        businessPartnerId
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
  }
}
