import { Request, Response } from 'express';

import { fetchBBDocumentsList } from './toeristische-verhuur-powerbrowser-bb-vergunning';
import { getAuth } from '../../auth/auth-helpers';
import { sendResponse, sendUnauthorized } from '../../routing/route-helpers';
import {
  decryptEncryptedRouteParamAndValidateSessionID,
  SessionIDAndROuteParamIdEncrypted,
} from '../shared/decrypt-route-param';

export async function handleFetchDocumentsRoute(
  req: Request<{ id: SessionIDAndROuteParamIdEncrypted }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    req.params.id,
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
