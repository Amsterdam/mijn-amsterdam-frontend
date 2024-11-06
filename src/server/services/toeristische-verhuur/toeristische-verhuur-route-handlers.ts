import { Response } from 'express';

import { fetchBBDocumentsList } from './toeristische-verhuur-powerbrowser-bb-vergunning';
import { getAuth } from '../../auth/auth-helpers';
import {
  RequestWithQueryParams,
  sendResponse,
  sendUnauthorized,
} from '../../routing/route-helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

export async function handleFetchDocumentsRoute(
  req: RequestWithQueryParams<{ id: string }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

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

  const zaakId = decryptResult.content;

  const response = await fetchBBDocumentsList(
    res.locals.requestID,
    authProfileAndToken,
    zaakId
  );

  return sendResponse(res, response);
}
