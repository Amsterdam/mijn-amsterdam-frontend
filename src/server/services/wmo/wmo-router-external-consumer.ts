import { Request, Response } from 'express';

import { fetchWmoVoorzieningenCompact } from './wmo';
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

wmoRouterPrivateNetwork.post(
  ExternalConsumerEndpoints.private.WMO_VOORZIENINGEN,
  async (req: Request, res: Response) => {
    // TODO: zod validation
    const bsn = req.body?.bsn as BSN;

    if (!bsn) {
      return sendBadRequest(res, 'BSN is required', null);
    }

    const response = await fetchWmoVoorzieningenCompact(bsn, {
      productGroup: ['WRA'],
      resultaat: ['toegewezen'],
    });
    return sendResponse(res, response);
  }
);
