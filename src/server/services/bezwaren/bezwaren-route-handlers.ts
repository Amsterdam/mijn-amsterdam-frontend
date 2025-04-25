import { Response } from 'express';

import { fetchBezwaarDetail } from './bezwaren';
import { getAuth } from '../../auth/auth-helpers';
import {
  RequestWithQueryParams,
  sendResponse,
  sendUnauthorized,
} from '../../routing/route-helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

export async function handleFetchBezwaarDetail(
  req: RequestWithQueryParams<{ id: string }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (authProfileAndToken) {
    const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
      req.query.id,
      authProfileAndToken
    );

    if (decryptResult.status === 'ERROR') {
      return sendResponse(res, decryptResult);
    }

    if (decryptResult.status === 'OK') {
      const response = await fetchBezwaarDetail(
        res.locals.requestID,
        authProfileAndToken,
        decryptResult.content
      );

      return sendResponse(res, response);
    }
  }
  return sendUnauthorized(res);
}
