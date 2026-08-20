import type { Request, Response } from 'express';

import { clientToServiceMap } from './api-config/api-config.ts';
import type {
  AanvragenRequestInputFilters,
  ZorgnedApiClient,
} from './api-config/request-input.ts';
import {
  requestInputBase,
  requestInputByClient,
  aanvraagDetailRequestInput,
} from './api-config/request-input.ts';
import {
  fetchMaApiAanvraagById,
  fetchMaApiAanvragen,
} from './zorgned-aanvragen-api-service.ts';
import { pick } from '../../../universal/helpers/utils.ts';
import {
  sendResponse,
  sendBadRequestInvalidInput,
} from '../../routing/route-helpers.ts';

function getClientOrDefault(clients?: ZorgnedApiClient[]): ZorgnedApiClient[] {
  // Keep backwards compatibility: this API originally defaulted to WMO and LLV.
  return clients && clients.length > 0 ? clients : ['WMO', 'LLV'];
}

export async function handleAanvragenRequest(req: Request, res: Response) {
  let baseRequestBody;
  const requestInputBodyByClient = {} as Record<ZorgnedApiClient, unknown>;

  try {
    baseRequestBody = requestInputBase.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const bsn = baseRequestBody.bsn;
  const clients = getClientOrDefault(baseRequestBody.clients);
  const clientsServices = pick(clientToServiceMap, clients);

  clients.forEach((client) => {
    try {
      requestInputBodyByClient[client] = requestInputByClient[client].parse(
        req.body
      );
    } catch (error) {
      return sendBadRequestInvalidInput(res, error);
    }
  });

  const filters = Object.keys(requestInputBodyByClient).length
    ? (requestInputBodyByClient as Record<
        ZorgnedApiClient,
        AanvragenRequestInputFilters
      >)
    : undefined;

  const response = await fetchMaApiAanvragen(clientsServices, bsn, filters);

  return sendResponse(res, response);
}

export async function handleAanvraagDetailRequest(req: Request, res: Response) {
  let validatedRequestBody;
  try {
    validatedRequestBody = aanvraagDetailRequestInput.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const bsn = validatedRequestBody.bsn;
  const clients = getClientOrDefault(validatedRequestBody.clients);
  const clientsServices = pick(clientToServiceMap, clients);

  const response = await fetchMaApiAanvraagById(
    clientsServices,
    bsn,
    validatedRequestBody.id
  );

  return sendResponse(res, response);
}

export const forTesting = {
  handleAanvragenRequest,
  handleAanvraagDetailRequest,
};
