import { Response } from 'express';

import { DecosZaakBase } from './config-and-types';
import {
  fetchDecosDocumentList,
  fetchDecosZakenFromSourceRaw,
} from './decos-service';
import {
  testAccountsDigid,
  testAccountsEherkenning,
} from '../../../universal/config/auth.development';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { getAuth } from '../../auth/auth-helpers';
import { AuthProfileAndToken } from '../../auth/auth-types';
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

export async function fetchZakenByUserIDs(
  req: RequestWithQueryParams<{ profileType: ProfileType }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const userIDsFromEnv =
    req.query.profileType === 'private'
      ? Object.keys(testAccountsDigid)
      : Object.keys(testAccountsEherkenning);

  const userIDs = userIDsFromEnv.length
    ? userIDsFromEnv
    : [authProfileAndToken.profile.id];

  const response = await Promise.all(
    userIDs.map((id) => {
      const authProfileAndTokenSubject: AuthProfileAndToken = {
        profile: {
          authMethod: 'digid',
          profileType: 'private',
          id,
          sid: authProfileAndToken.profile.sid,
        },
        token: '',
      };

      return fetchDecosZakenFromSourceRaw(
        res.locals.requestID,
        authProfileAndTokenSubject
      );
    })
  );
  return res.send(apiSuccessResult(response.map((r) => r.content).flat()));
}
