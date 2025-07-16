import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import * as z from 'zod/v4';

import { createEMandate } from './afis-e-mandates';
import type {
  EMandateSignRequestPayload,
  EMandateSignRequestNotificationPayload,
  POMEMandateSignRequestPayload,
  AfisEMandateSource,
} from './afis-types';
import { type ApiResponse } from '../../../universal/helpers/api';
import { ExternalConsumerEndpoints } from '../../routing/bff-routes';
import {
  createBFFRouter,
  sendBadRequest,
  sendInternalServerError,
} from '../../routing/route-helpers';
import { captureException } from '../monitoring';

const routerPrivateNetwork = createBFFRouter({
  id: 'afis-external-consumer-private-network',
});

const eMandateSignRequestStatusNotificationPayload = z.object({
  businessPartnerId: z.string(),
  senderIBAN: z.string(),
  senderBIC: z.string(),
  senderName: z.string(),
  eMandateSignDate: z.string(),
  creditorIBAN: z.string(),
});

/**
 * Handles the eMandate sign request status notification from the payment provider.
 * With this information, we can create an eMandate in the AFIS system.
 */
async function handleAfisEMandateSignRequestStatusNotification(
  req: Request,
  res: Response
) {
  const notificationPayload =
    req.body as Partial<POMEMandateSignRequestPayload> | null;

  let eMandatePayload: EMandateSignRequestPayload &
    EMandateSignRequestNotificationPayload;

  try {
    eMandatePayload = eMandateSignRequestStatusNotificationPayload.parse({
      businessPartnerId: notificationPayload?.debtornumber?.toString(),
      senderIBAN: notificationPayload?.iban,
      senderBIC: notificationPayload?.bic,
      senderName: notificationPayload?.account_owner,
      eMandateSignDate: notificationPayload
        ? `${notificationPayload?.event_date}T${notificationPayload?.event_time}:00Z`
        : null, // ISO 8601 format
      creditorIBAN: notificationPayload?.variable1,
    });
  } catch (error) {
    // Sends the validation error to the monitoring service.
    captureException(error);
    return sendBadRequest(
      res,
      'Invalid eMandate sign request status notification payload'
    );
  }

  let createEmandateResponse: ApiResponse<AfisEMandateSource> | null = null;

  // TODO: Figure out if we can actually create the eMandate from this event.
  try {
    createEmandateResponse = await createEMandate(eMandatePayload);
  } catch (error) {
    // If the eMandate creation fails, we should log the error and return an error response.
    // This is important for observability and debugging.
    captureException(error);
    return sendInternalServerError(
      res,
      'Failed to create eMandate from sign request status notification'
    );
  }

  const isOK = createEmandateResponse !== null;

  res.status(isOK ? HttpStatusCode.Ok : HttpStatusCode.InternalServerError);

  return res.send(isOK ? 'OK' : 'ERROR');
}

// TODO: this endpoint should be made available to the EnableU network. Find out if this is possible and how to do it.
routerPrivateNetwork.post(
  ExternalConsumerEndpoints.private.AFIS_EMANDATE_SIGN_REQUEST_STATUS_NOTIFY,
  handleAfisEMandateSignRequestStatusNotification
);

export const afisExternalConsumerRouter = {
  private: routerPrivateNetwork,
};

export const forTesting = {
  handleAfisEMandateSignRequestStatusNotify:
    handleAfisEMandateSignRequestStatusNotification,
};
