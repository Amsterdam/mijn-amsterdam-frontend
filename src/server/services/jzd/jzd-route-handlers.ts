import type { Request, Response } from 'express';

import {
  jzdDataRequestConfigs,
  voorzieningDetailRequestInput,
  voorzieningenRequestInput,
  ZORGNED_USER_KEYS,
  type ZorgnedApiConfigKey,
} from './jzd-service-config.ts';
import {
  fetchMaApiVoorzieningById,
  fetchMaApiVoorzieningen,
} from './jzd-voorzieningen-api-service.ts';
import { ZORGNED_WMO_API_CONFIG_KEY } from './wmo/wmo-config.ts';
import { omit } from '../../../universal/helpers/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import {
  sendResponse,
  sendBadRequestInvalidInput,
  type ResponseAuthenticated,
  type RequestWithQueryParams,
} from '../../routing/route-helpers.ts';
import type {
  fetchAanvragenRaw,
  fetchAllDocumentsRaw,
} from '../zorgned/zorgned-service.ts';
import { fetchDocument } from '../zorgned/zorgned-service.ts';

export function fetchZorgnedDocumentJZD(
  zorgnedApiConfigKey: ZorgnedApiConfigKey
) {
  return async function fetchZorgnedDocument(
    authProfileAndToken: AuthProfileAndToken,
    documentId: string
  ) {
    const response = fetchDocument(
      authProfileAndToken.profile.id,
      getCustomApiConfig(jzdDataRequestConfigs[zorgnedApiConfigKey]),
      documentId
    );
    return response;
  };
}

function sendBadRequestInvalidKey(res: Response) {
  return sendBadRequestInvalidInput(res, {
    message: `Invalid key provided. Expected one of ${ZORGNED_USER_KEYS.join(
      ', '
    )}`,
  });
}

export function sendZorgnedResponseRAW(
  service: typeof fetchAllDocumentsRaw | typeof fetchAanvragenRaw
) {
  return async function fetchZorgnedRAW(
    req: RequestWithQueryParams<{
      key?: (typeof ZORGNED_USER_KEYS)[number];
    }>,
    res: ResponseAuthenticated
  ) {
    const key = req.query.key || ZORGNED_WMO_API_CONFIG_KEY;

    if (!ZORGNED_USER_KEYS.includes(key)) {
      return sendBadRequestInvalidKey(res);
    }

    const response = await service(res.locals.userID, {
      dataRequestConfig: getCustomApiConfig(jzdDataRequestConfigs[key]),
    });

    return sendResponse(res, response);
  };
}

export async function handleVoorzieningenRequest(req: Request, res: Response) {
  // Validate the request body so we can be sure it has the correct shape and values.
  let validatedRequestBody;
  try {
    validatedRequestBody = voorzieningenRequestInput.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const bsn = validatedRequestBody.bsn;

  const options = omit(validatedRequestBody, ['bsn']);
  const filters = Object.keys(options).length ? options : undefined;

  const response = await fetchMaApiVoorzieningen(bsn, filters);

  return sendResponse(res, response);
}

export async function handleVoorzieningDetailRequest(
  req: Request,
  res: Response
) {
  // Validate the request body so we can be sure it has the correct shape and values.
  let validatedRequestBody;
  try {
    validatedRequestBody = voorzieningDetailRequestInput.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const bsn = validatedRequestBody.bsn;

  const response = await fetchMaApiVoorzieningById(
    bsn,
    validatedRequestBody.id
  );

  return sendResponse(res, response);
}

export const forTesting = {
  handleVoorzieningenRequest,
  handleVoorzieningDetailRequest,
};
