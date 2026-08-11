import type { Request, Response } from 'express';

import {
  voorzieningDetailRequestInput,
  voorzieningenRequestInput,
} from './zorgned-voorzieningen-api-service-config.ts';
import {
  fetchMaApiVoorzieningById,
  fetchMaApiVoorzieningen,
} from './zorgned-voorzieningen-api-service.ts';
import { omit } from '../../../universal/helpers/utils.ts';
import {
  sendResponse,
  sendBadRequestInvalidInput,
} from '../../routing/route-helpers.ts';
import { fetchZorgnedAanvragenHLI } from '../hli/hli-zorgned-service.ts';
import { fetchZorgnedAanvragenJeugd } from '../jzd/jeugd/jeugd.ts';
import { fetchZorgnedAanvragenWMO } from '../jzd/wmo/wmo-zorgned-service.ts';

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

  const [
    wmoVoorzieningenResponse,
    jeugdVoorzieningenResponse,
    hliVoorzieningenResponse,
  ] = await Promise.all([
    fetchZorgnedAanvragenWMO(bsn),
    fetchZorgnedAanvragenJeugd(bsn),
    fetchZorgnedAanvragenHLI(bsn),
  ]);

  const response = fetchMaApiVoorzieningen(
    [
      wmoVoorzieningenResponse,
      jeugdVoorzieningenResponse,
      hliVoorzieningenResponse,
    ],
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
