import { Request, Response } from 'express';

import {
  fetchWmoVoorzieningenCompact,
  type FetchWmoVoorzieningFilter,
} from './wmo';
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

wmoRouterPrivateNetwork.post(
  ExternalConsumerEndpoints.private.WMO_VOORZIENINGEN,
  async (req: Request, res: Response) => {
    // TODO: zod validation
    const bsn = req.body?.bsn as BSN;

    if (!bsn) {
      return sendBadRequest(res, 'BSN is required', null);
    }

    const response = await fetchWmoVoorzieningenCompact(bsn, {
      productGroup: [WRA_PRODUCT_GROUP],
      filter: isActueleUitgevoerdeWoonruimteAanpassing,
    });

    return sendResponse(res, response);
  }
);
