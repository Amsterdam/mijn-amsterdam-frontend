import { Request, Response } from 'express';
import { fetchAfisBusinessPartnerDetails } from './afis';
import { sendResponse, sendUnauthorized } from '../../helpers/app';
import { AfisBusinessPartnerDetailsTransformed } from './afis-types';
import { decrypt } from '../../helpers/encrypt-decrypt';

export async function handleFetchAfisBusinessPartner(
  req: Request<{ businessPartnerIdEncrypted: string }>,
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
