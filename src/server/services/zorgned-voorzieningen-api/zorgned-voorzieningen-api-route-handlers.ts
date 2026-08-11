import type { Request, Response } from 'express';

import { clientToServiceMap } from './api-config/api-config.ts';
import {
  requestInputBase,
  requestInputByClient,
  voorzieningDetailRequestInput,
} from './api-config/request-input.ts';
import {
  fetchMaApiVoorzieningById,
  fetchMaApiVoorzieningen,
} from './zorgned-voorzieningen-api-service.ts';
import {
  sendResponse,
  sendBadRequestInvalidInput,
} from '../../routing/route-helpers.ts';
import { fetchZorgnedAanvragenHLI } from '../hli/hli-zorgned-service.ts';
import { fetchZorgnedAanvragenJeugd } from '../jzd/jeugd/jeugd.ts';
import { fetchZorgnedAanvragenWMO } from '../jzd/wmo/wmo-zorgned-service.ts';

export async function handleVoorzieningenRequest(req: Request, res: Response) {
  let baseRequestBody;
  let optionsRequestBodyByClient;

  try {
    baseRequestBody = requestInputBase.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const bsn = baseRequestBody.bsn;
  const client = baseRequestBody.client ?? 'WMO'; // Default to WMO if no clients are specified. This api was originally only for WMO, so we keep that behavior for backwards compatibility.

  try {
    optionsRequestBodyByClient = requestInputByClient[client].parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const filters = Object.keys(optionsRequestBodyByClient).length
    ? optionsRequestBodyByClient
    : undefined;

  const { fetch: serviceFunction, apiConfig } = clientToServiceMap[client];

  const response = fetchMaApiVoorzieningen(
    await serviceFunction(bsn),
    apiConfig,
    filters
  );

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

  const [
    wmoVoorzieningenResponse,
    jeugdVoorzieningenResponse,
    hliVoorzieningenResponse,
  ] = await Promise.all([
    fetchZorgnedAanvragenWMO(bsn),
    fetchZorgnedAanvragenJeugd(bsn),
    fetchZorgnedAanvragenHLI(bsn),
  ]);

  const response = fetchMaApiVoorzieningById(
    [
      wmoVoorzieningenResponse,
      jeugdVoorzieningenResponse,
      hliVoorzieningenResponse,
    ],
    validatedRequestBody.id
  );

  return sendResponse(res, response);
}

export const forTesting = {
  handleVoorzieningenRequest,
  handleVoorzieningDetailRequest,
};
