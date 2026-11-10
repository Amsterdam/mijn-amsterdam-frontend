import type { Request, Response } from 'express';

import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import {
  sendBadRequestInvalidInput,
  sendResponse,
} from '../../routing/route-helpers.ts';
import {
  getServiceAlerts,
  handleUpsertServiceAlert,
} from './service-alerts.ts';
import {
  type ServiceAlertInput,
  serviceAlertInput,
} from './service-alerts.types.ts';

export async function handleGetServiceAlerts(_req: Request, res: Response) {
  const serviceAlerts = await getServiceAlerts();
  return sendResponse(res, apiSuccessResult(serviceAlerts));
}

export async function handleUpsertServiceAlertRequest(
  req: Request,
  res: Response
) {
  let serviceAlert: ServiceAlertInput;

  try {
    serviceAlert = serviceAlertInput.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const result = await handleUpsertServiceAlert(serviceAlert);
  return sendResponse(res, apiSuccessResult(result));
}
