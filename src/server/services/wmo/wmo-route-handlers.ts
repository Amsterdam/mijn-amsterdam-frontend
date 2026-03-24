import type { Request, Response } from 'express';

import { fetchMaApiVoorzieningen } from './wmo-external-consumer-service.ts';
import {
  voorzieningenRequestInput,
  ZORGNED_JZD_API_CONFIG_KEY,
} from './wmo-service-config.ts';
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

export async function fetchZorgnedJZDDocument(
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

export async function fetchZorgnedJZDDocuments(
  req: Request,
  res: ResponseAuthenticated
) {
  const response = await fetchAllDocumentsRaw(res.locals.userID, {
    zorgnedApiConfigKey: ZORGNED_JZD_API_CONFIG_KEY,
  });

  return sendResponse(res, response);
}

export async function fetchZorgnedJZDAanvragen(
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
  const maActies = validatedRequestBody.maActies;
  const maProductgroep = validatedRequestBody.maProductgroep;
  const response = await fetchMaApiVoorzieningen(bsn, {
    maActies,
    maProductgroep,
  });

  return sendResponse(res, response);
}
