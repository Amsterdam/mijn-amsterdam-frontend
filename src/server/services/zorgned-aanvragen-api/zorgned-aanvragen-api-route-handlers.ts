import type { Request, Response } from 'express';

import { clientToServiceMap } from './api-config/api-config.ts';
import {
  requestInputBase,
  requestInputByClient,
  aanvraagDetailRequestInput,
} from './api-config/request-input.ts';
import {
  fetchMaApiAanvraagById,
  fetchMaApiAanvragen,
} from './zorgned-aanvragen-api-service.ts';
import {
  sendResponse,
  sendBadRequestInvalidInput,
} from '../../routing/route-helpers.ts';

type SupportedClient = keyof typeof clientToServiceMap;

function getClientOrDefault(client?: SupportedClient): SupportedClient {
  // Keep backwards compatibility: this API originally defaulted to WMO.
  return client ?? 'WMO';
}

export async function handleAanvragenRequest(req: Request, res: Response) {
  let baseRequestBody;
  let optionsRequestBodyByClient;

  try {
    baseRequestBody = requestInputBase.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const bsn = baseRequestBody.bsn;
  const client = getClientOrDefault(baseRequestBody.client);

  try {
    optionsRequestBodyByClient = requestInputByClient[client].parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const filters = Object.keys(optionsRequestBodyByClient).length
    ? optionsRequestBodyByClient
    : undefined;

  const { fetch: serviceFunction, apiConfig } = clientToServiceMap[client];

  const response = fetchMaApiAanvragen(
    await serviceFunction(bsn),
    apiConfig,
    filters
  );

  return sendResponse(res, response);
}

export async function handleAanvraagDetailRequest(req: Request, res: Response) {
  // Validate the request body so we can be sure it has the correct shape and values.
  let validatedRequestBody;
  try {
    validatedRequestBody = aanvraagDetailRequestInput.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const bsn = validatedRequestBody.bsn;
  const client = getClientOrDefault(validatedRequestBody.client);
  const serviceResponse = await clientToServiceMap[client].fetch(bsn);

  const response = fetchMaApiAanvraagById(
    serviceResponse,
    validatedRequestBody.id,
    clientToServiceMap[client].apiConfig
  );

  return sendResponse(res, response);
}

export const forTesting = {
  handleAanvragenRequest,
  handleAanvraagDetailRequest,
};
