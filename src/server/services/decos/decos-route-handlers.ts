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
  sendBadRequest,
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

  if (!['private', 'commercial'].includes(req.query.profileType)) {
    return sendBadRequest(res, 'Invalid profileType');
  }

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const userIDsFromEnv =
    req.query.profileType === 'private'
      ? Object.values(testAccountsDigid)
      : Object.values(testAccountsEherkenning);

  const userIDs = userIDsFromEnv.length
    ? userIDsFromEnv
    : [authProfileAndToken.profile.id];

  const responses = [];

  for (const id of userIDs) {
    const authProfileAndTokenSubject: AuthProfileAndToken = {
      profile: {
        authMethod:
          req.query.profileType === 'private' ? 'digid' : 'eherkenning',
        profileType: req.query.profileType,
        id,
        sid: authProfileAndToken.profile.sid,
      },
      token: '',
    };

    const response = await fetchDecosZakenFromSourceRaw(
      res.locals.requestID,
      authProfileAndTokenSubject
    );

    if (response.status === 'OK') {
      responses.push(response.content);
    }
  }

  return res.send(
    apiSuccessResult({
      profileType: req.query.profileType,
      userIDs,
      zaken: responses.flat(),
    })
  );
}
