import { Request } from 'express';

import { fetchBezwaarDetail, fetchBezwaren } from './bezwaren';
import {
  RequestWithQueryParams,
  sendResponse,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

export async function handleFetchBezwaarDetail(
  req: RequestWithQueryParams<{ id: string }>,
  res: ResponseAuthenticated
) {
  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    req.query.id,
    res.locals.authProfileAndToken
  );

  if (decryptResult.status === 'ERROR') {
    return sendResponse(res, decryptResult);
  }

  if (decryptResult.status === 'OK') {
    const response = await fetchBezwaarDetail(
      res.locals.authProfileAndToken,
      decryptResult.content
    );

    return sendResponse(res, response);
  }
}

export async function handleFetchBezwaarDetailRaw(
  req: RequestWithQueryParams<{ id: string }>,
  res: ResponseAuthenticated
) {
  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    req.query.id,
    res.locals.authProfileAndToken
  );

  if (decryptResult.status === 'ERROR') {
    return sendResponse(res, decryptResult);
  }

  if (decryptResult.status === 'OK') {
    const DO_TRANSFORM = false;
    const response = await fetchBezwaarDetail(
      res.locals.authProfileAndToken,
      decryptResult.content,
      DO_TRANSFORM
    );

    return sendResponse(res, response);
  }
}

export async function handleFetchBezwarenRaw(
  _req: Request,
  res: ResponseAuthenticated
) {
  const DO_TRANSFORM = false;
  return res.send(
    await fetchBezwaren(res.locals.authProfileAndToken, DO_TRANSFORM)
  );
}
