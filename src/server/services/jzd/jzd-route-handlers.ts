import type { Request, Response } from 'express';

import {
  voorzieningDetailRequestInput,
  voorzieningenRequestInput,
} from './jzd-service-config.ts';
import {
  fetchMaApiVoorzieningById,
  fetchMaApiVoorzieningen,
} from './jzd-voorzieningen-api-service.ts';
import { ZORGNED_JZD_API_CONFIG_KEY } from './wmo/wmo-config.ts';
import { omit } from '../../../universal/helpers/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import {
  sendResponse,
  sendBadRequestInvalidInput,
  type ResponseAuthenticated,
} from '../../routing/route-helpers.ts';
import {
  fetchAanvragenRaw,
  fetchAllDocumentsRaw,
  fetchDocument,
} from '../zorgned/zorgned-service.ts';

export async function fetchZorgnedDocumentWMO(
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const response = fetchDocument(
    authProfileAndToken.profile.id,
    ZORGNED_JZD_API_CONFIG_KEY,
    documentId
  );
  return response;
}

export async function fetchZorgnedDocumentsWMO(
  req: Request,
  res: ResponseAuthenticated
) {
  const response = await fetchAllDocumentsRaw(res.locals.userID, {
    zorgnedApiConfigKey: ZORGNED_JZD_API_CONFIG_KEY,
  });

  return sendResponse(res, response);
}

export async function fetchZorgnedAanvragenWMO(
  req: Request,
  res: ResponseAuthenticated
) {
  const response = await fetchAanvragenRaw(res.locals.userID, {
    zorgnedApiConfigKey: ZORGNED_JZD_API_CONFIG_KEY,
  });

  return sendResponse(res, response);
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
