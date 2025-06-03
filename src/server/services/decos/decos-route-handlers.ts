import { Response } from 'express';

import { SELECT_FIELDS_TRANSFORM_BASE } from './decos-field-transformers';
import {
  fetchDecosDocumentList,
  fetchDecosZaakByKeyFromSourceRaw,
  fetchDecosZakenFromSourceRaw,
  ZAAK_SUB_TYPE,
} from './decos-service';
import { DecosZaakBase } from './decos-types';
import {
  testAccountsDigid,
  testAccountsEherkenning,
} from '../../../universal/config/auth.development';
import { IS_PRODUCTION } from '../../../universal/config/env';
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
      authProfileAndToken.profile.sid,
      zaakKey
    );

    return sendResponse(res, response);
  }

  return sendUnauthorized(res);
}

function getUserIdsByUsernames(
  accounts: Record<string, string> | null,
  username?: string
) {
  return accounts
    ? Object.entries(accounts)
        .filter(([username_]) => !username || username_ === username)
        .map(([_username, userID]) => userID)
    : [];
}

export async function fetchZaakByKey(
  req: RequestWithQueryParams<{
    key: string;
    includeProperties?: '1';
    selectFields?: string;
    subType?: (typeof ZAAK_SUB_TYPE)[number];
  }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const key = req.query.key.replace(/[^A-Z0-9]/g, '');

  if (!key) {
    return sendBadRequest(res, 'Invalid key');
  }

  if (req.query.subType && !ZAAK_SUB_TYPE.includes(req.query.subType)) {
    return sendBadRequest(res, 'Invalid subType');
  }

  const selectFields =
    req.query.selectFields === 'core'
      ? Object.keys(SELECT_FIELDS_TRANSFORM_BASE).join(',')
      : req.query.selectFields;

  const response = await fetchDecosZaakByKeyFromSourceRaw(
    key,
    selectFields,
    req.query.includeProperties === '1',
    req.query.subType
  );

  return sendResponse(res, response);
}

export async function fetchZakenByUserIDs(
  req: RequestWithQueryParams<{
    profileType: ProfileType;
    selectFields?: string;
    filterCaseTypes?: string;
    includeProperties?: '1';
    top?: string;
    username?: string;
  }>,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (!['private', 'commercial'].includes(req.query.profileType)) {
    return sendBadRequest(res, 'Invalid profileType');
  }

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const selectFields =
    req.query.selectFields === 'core'
      ? Object.keys(SELECT_FIELDS_TRANSFORM_BASE).join(',')
      : req.query.selectFields;

  const userIDsFromEnv =
    req.query.profileType === 'private'
      ? getUserIdsByUsernames(testAccountsDigid, req.query.username)
      : getUserIdsByUsernames(testAccountsEherkenning, req.query.username);

  // Only allow fetching zaken for test accounts in non-production environments
  const userIDs =
    userIDsFromEnv.length && !IS_PRODUCTION
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
      expiresAtMilliseconds: authProfileAndToken.expiresAtMilliseconds,
    };

    const regexCaseTypeFilter = /[^a-zA-Z\s-]/g;
    const regexTop = /^\d+$/g;

    const response = await fetchDecosZakenFromSourceRaw(
      authProfileAndTokenSubject,
      selectFields,
      req.query?.filterCaseTypes?.replace(regexCaseTypeFilter, ''),
      req.query.includeProperties === '1',
      req.query.top?.replace(regexTop, '')
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
