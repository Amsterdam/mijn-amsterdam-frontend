import { Request, Response } from 'express';
import * as z from 'zod';

import {
  fetchWmoVoorzieningenCompact,
  type FetchWmoVoorzieningFilter,
} from './wmo';
import { ZodValidators } from '../../helpers/validation';
import { ExternalConsumerEndpoints } from '../../routing/bff-routes';
import {
  createBFFRouter,
  sendBadRequest,
  sendResponse,
} from '../../routing/route-helpers';
import type { BSN } from '../zorgned/zorgned-types';

export const wmoRouterPrivateNetwork = createBFFRouter({
  id: 'external-consumer-private-network-wmo',
});

const WRA_PRODUCT_GROUP = 'WRA';
const WRA_STEP_STATUS = 'Aanpassing uitgevoerd';

const isActueleUitgevoerdeWoonruimteAanpassing: FetchWmoVoorzieningFilter = (
  voorziening,
  steps
) =>
  voorziening.isActueel &&
  steps.some((step) => step.status === WRA_STEP_STATUS && step.isActive);

const apiInput = z.object({
  bsn: ZodValidators.BSN,
});

async function handleVoorzieningenRequest(req: Request, res: Response) {
  try {
    apiInput.parse(req.body);
  } catch (error) {
    let inputError = 'Invalid input';

    if (error instanceof z.ZodError) {
      inputError = error.issues.map((e) => e.message).join(', ');
    }

    return sendBadRequest(res, inputError);
  }

  const bsn = req.body?.bsn as BSN;
  const response = await fetchWmoVoorzieningenCompact(bsn, {
    productGroup: [WRA_PRODUCT_GROUP],
    filter: isActueleUitgevoerdeWoonruimteAanpassing,
  });

  return sendResponse(res, response);
}

wmoRouterPrivateNetwork.post(
  ExternalConsumerEndpoints.private.WMO_VOORZIENINGEN,
  handleVoorzieningenRequest
);

export const forTesting = {
  handleVoorzieningenRequest,
};
