import { Request, Response } from 'express';
import { fetchAfisBusinessPartner } from './afis';
import { sendResponse } from '../../helpers/app';

export async function handleFetchAfisBusinessPartner(
  req: Request<{ businessPartnerId: string }>,
  res: Response
) {
  const response = await fetchAfisBusinessPartner(
    res.locals.requestID,
    req.params.businessPartnerId
  );

  sendResponse(res, response);
}