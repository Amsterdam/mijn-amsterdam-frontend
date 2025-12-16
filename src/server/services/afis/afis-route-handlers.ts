import { HttpStatusCode } from 'axios';
import { Response, Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import z from 'zod';

import { createOrUpdateEMandateFromStatusNotificationPayload } from './afis-e-mandates';
import { fetchAfisFacturenByState } from './afis-facturen';
import {
  AfisFactuurState,
  BusinessPartnerIdPayload,
  type EMandateSignRequestNotificationPayload,
  type EMandateSignRequestPayload,
  type POMEMandateSignRequestPayload,
} from './afis-types';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import { AuthProfile } from '../../auth/auth-types';
import {
  RequestWithRouteAndQueryParams,
  sendBadRequestInvalidInput,
  sendResponse,
  type RecordStr2,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';
import { captureException } from '../monitoring';
import {
  decryptPayloadAndValidateSessionID,
  EncryptedPayloadAndSessionID,
} from '../shared/decrypt-route-param';

function isPostiveInt(str: string) {
  return /^\d+$/.test(str);
}

type QueryParamsWithEncryptedPayload<
  QuerParamsAdditional extends RecordStr2 = RecordStr2,
  K extends string = string,
> = {
  [key in K]: EncryptedPayloadAndSessionID;
} & QuerParamsAdditional;

export type RequestWithEncryptedPayloadParam<
  P extends ParamsDictionary,
  Q extends RecordStr2 = QueryParamsWithEncryptedPayload,
> = RequestWithRouteAndQueryParams<P, Q>;

export interface AfisFacturenRouteParams extends ParamsDictionary {
  state: AfisFactuurState;
}
/** Route handler to get a series of invoices (facturen) from AFIS (SAP)
 *
 *  # Optional query parameters
 *
 *  top: The maximum number of invoices.
 *    for example `$top=4` will get you four invoices out of potentially 200.
 */
export async function handleFetchAfisFacturen(
  payload: BusinessPartnerIdPayload,
  authProfile: AuthProfile,
  req: RequestWithEncryptedPayloadParam<
    AfisFacturenRouteParams,
    QueryParamsWithEncryptedPayload<{ top?: string }>
  >
) {
  let top = req.query.top;

  if (typeof top !== 'string' || !isPostiveInt(top)) {
    top = undefined;
  }

  return fetchAfisFacturenByState(authProfile.sid, {
    state: req.params.state,
    businessPartnerID: payload.businessPartnerId,
    top,
  });
}

export function handleAfisRequestWithEncryptedPayloadQueryParam<
  QueryPayload extends qs.ParsedQs,
  ServiceResponse extends Promise<ApiResponse<unknown>>,
  RouteParams extends ParamsDictionary = ParamsDictionary,
>(
  serviceMethod: (
    payload: QueryPayload,
    authProfile: AuthProfile,
    request: RequestWithEncryptedPayloadParam<RouteParams>
  ) => ServiceResponse,
  payloadParamName: string = 'payload'
) {
  // Return the route handler (middleware) that will handle the request.
  return async function handleEMandateApiRequest(
    req: RequestWithEncryptedPayloadParam<RouteParams>,
    res: ResponseAuthenticated
  ) {
    // Get the query parameter value for the encrypted payload.
    const payloadEncrypted = req.query[payloadParamName];

    const decryptResult = decryptPayloadAndValidateSessionID<QueryPayload>(
      payloadEncrypted,
      res.locals.authProfileAndToken
    );
    if (decryptResult.status === 'ERROR') {
      return sendResponse(res, decryptResult);
    }

    const payloadDecrypted = decryptResult.content.payload as QueryPayload;

    // Call the service method with the decrypted payload.
    const serviceMethodResponse = await serviceMethod(
      payloadDecrypted,
      res.locals.authProfileAndToken.profile,
      req
    );

    return sendResponse(res, serviceMethodResponse);
  };
}

const eMandateSignRequestStatusNotificationPayload = z.object({
  businessPartnerId: z.string(),
  senderIBAN: z.string(),
  senderBIC: z.string(),
  senderName: z.string(),
  eMandateSignDate: z.iso.datetime(),
  creditorIBAN: z.string(),
});

/**
 * Handles the eMandate sign request status notification from the payment provider.
 * With this information, we can create an eMandate in the AFIS system.
 */
export async function handleAfisEMandateSignRequestStatusNotification(
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
    return sendBadRequestInvalidInput(res, error);
  }

  let createEmandateResponse: ApiResponse<unknown> | null = null;

  // TODO: Figure out if we can actually create the eMandate from this event. - https://gemeente-amsterdam.atlassian.net/browse/MIJN-12289
  try {
    createEmandateResponse =
      await createOrUpdateEMandateFromStatusNotificationPayload(
        eMandatePayload
      );
  } catch (error) {
    // If the eMandate creation fails, we should log the error and return an error response.
    // This is important because the creation of the eMandate is a crucial part of the sign request process.
    // Without it, the user will not be able to complete their mandate activation.
    captureException(error);
  }

  const isOK = createEmandateResponse !== null;

  const response = isOK
    ? apiSuccessResult('E-Mandate created successfully')
    : apiErrorResult(
        'Failed to create E-Mandate from sign request status notification',
        null,
        HttpStatusCode.InternalServerError
      );

  return sendResponse(res, response);
}
