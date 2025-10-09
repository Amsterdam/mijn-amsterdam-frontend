import { Request, Response } from 'express';
import z from 'zod';

import { fetchActueleWRAVoorzieningenCompact } from './wmo';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { ZodValidators } from '../../helpers/validation';
import {
  sendResponse,
  sendBadRequestInvalidInput,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';
import {
  fetchAanvragenRaw,
  fetchAllDocuments,
  fetchDocument,
} from '../zorgned/zorgned-service';

const ZORGNED_JZD_API_CONFIG_KEY = 'ZORGNED_JZD';

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
  const response = await fetchAllDocuments(res.locals.userID, {
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

const voorzieningenRequestInput = z.object({
  bsn: ZodValidators.BSN,
});

export async function handleVoorzieningenRequest(req: Request, res: Response) {
  // Validate the request body so we can be sure it has the correct shape and values.
  let validatedRequestBody;
  try {
    validatedRequestBody = voorzieningenRequestInput.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const bsn = validatedRequestBody.bsn;
  const response = await fetchActueleWRAVoorzieningenCompact(bsn);

  return sendResponse(res, response);
}
