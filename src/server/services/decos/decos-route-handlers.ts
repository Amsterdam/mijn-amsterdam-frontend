import { Response } from 'express';

import { DecosZaakBase } from './config-and-types';
import { fetchDecosDocumentList } from './decos-service';
import { getAuth } from '../../auth/auth-helpers';
import {
  RequestWithQueryParams,
  sendResponse,
  sendUnauthorized,
} from '../../routing/route-helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

export async function fetchDecosDocumentsList(
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

    const zaakKey: DecosZaakBase['key'] = decryptResult.content;
    const response = await fetchDecosDocumentList(
      res.locals.requestID,
      zaakKey
    );

    return sendResponse(res, response);
  }

  return sendUnauthorized(res);
}
