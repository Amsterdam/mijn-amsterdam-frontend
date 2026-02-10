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
  testAccountDataDigid as testAccountDataDigid,
  testAccountDataEherkenning as testAccountDataEherkenning,
  TestUserData,
} from '../../../universal/config/auth.development';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  RequestWithQueryParams,
  sendBadRequest,
  sendResponse,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

export async function handleFetchDecosDocumentsList(
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

  const zaakKey: DecosZaakBase['key'] = decryptResult.content;
  const response = await fetchDecosDocumentList(
    res.locals.authProfileAndToken.profile.sid,
    zaakKey
  );

  return sendResponse(res, response);
}

function getUserIds(testUserData: TestUserData | null, username?: string) {
  return testUserData
    ? testUserData.accounts
        .filter((account) => !username || account.username === username)
        .map((account) => account.profileId)
    : [];
}

export async function fetchZaakByKey(
  req: RequestWithQueryParams<{
    key: string;
    includeProperties?: '1';
    selectFields?: string;
    subType?: (typeof ZAAK_SUB_TYPE)[number];
  }>,
  res: ResponseAuthenticated
) {
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
  if (!['private', 'commercial'].includes(req.query.profileType)) {
    return sendBadRequest(res, 'Invalid profileType');
  }

  const selectFields =
    req.query.selectFields === 'core'
      ? Object.keys(SELECT_FIELDS_TRANSFORM_BASE).join(',')
      : req.query.selectFields;

  const userIDsFromEnv =
    req.query.profileType === 'private'
      ? getUserIds(testAccountDataDigid, req.query.username)
      : getUserIds(testAccountDataEherkenning, req.query.username);

  // Only allow fetching zaken for test accounts in non-production environments
  const userIDs =
    userIDsFromEnv.length && !IS_PRODUCTION
      ? userIDsFromEnv
      : [res.locals.userID];

  const responses = [];

  for (const id of userIDs) {
    const authProfileAndTokenSubject: AuthProfileAndToken = {
      profile: {
        authMethod:
          req.query.profileType === 'private' ? 'digid' : 'eherkenning',
        profileType: req.query.profileType,
        id,
        sid: res.locals.authProfileAndToken.profile.sid,
      },
      token: '',
      expiresAtMilliseconds:
        res.locals.authProfileAndToken.expiresAtMilliseconds,
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
