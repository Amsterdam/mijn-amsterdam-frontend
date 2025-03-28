import { Response } from 'express';

import { getAuth } from '../../auth/auth-helpers';
import {
  RequestWithQueryParams,
  sendResponse,
  sendUnauthorized,
} from '../../routing/route-helpers';
import { fetchDecosDocumentList } from '../decos/decos-service';
import { DecosZaakBase } from '../decos/decos-types';
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
