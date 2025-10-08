import { Request, Response } from 'express';
import * as z from 'zod';

import { fetchActueleWRAVoorzieningenCompact } from './wmo';
import {
  fetchZorgnedJZDAanvragen,
  fetchZorgnedJZDDocument,
  fetchZorgnedJZDDocuments,
} from './wmo-route-handlers';
import { featureToggle, routes } from './wmo-service-config';
import { ZodValidators } from '../../helpers/validation';
import {
  createBFFRouter,
  sendBadRequestInvalidInput,
  sendResponse,
} from '../../routing/route-helpers';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler';

const wmoRouterPrivateNetwork = createBFFRouter({
  id: 'external-consumer-private-network-wmo',
  isEnabled: featureToggle.router.private.isEnabled,
});

const voorzieningenRequestInput = z.object({
  bsn: ZodValidators.BSN,
});

async function handleVoorzieningenRequest(req: Request, res: Response) {
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

wmoRouterPrivateNetwork.post(
  routes.private.WMO_VOORZIENINGEN,
  handleVoorzieningenRequest
);

const wmoRouterProtected = createBFFRouter({ id: 'protected-wmo' });

// WMO Zorgned Doc download
attachDocumentDownloadRoute(
  wmoRouterProtected,
  routes.protected.WMO_DOCUMENT_DOWNLOAD,
  fetchZorgnedJZDDocument
);

wmoRouterProtected.get(
  routes.protected.WMO_AANVRAGEN_RAW,
  fetchZorgnedJZDAanvragen
);
wmoRouterProtected.get(
  routes.protected.WMO_DOCUMENTS_LIST_RAW,
  fetchZorgnedJZDDocuments
);

export const wmoRouter = {
  private: wmoRouterPrivateNetwork,
  protected: wmoRouterProtected,
};

export const forTesting = {
  handleVoorzieningenRequest,
};
