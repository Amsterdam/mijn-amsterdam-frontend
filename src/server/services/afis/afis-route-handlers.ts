import { Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { fetchAfisFacturenByState } from './afis-facturen';
import { AfisFactuurState, BusinessPartnerIdPayload } from './afis-types';
import { ApiResponse_DEPRECATED } from '../../../universal/helpers/api';
import { getAuth } from '../../auth/auth-helpers';
import { AuthProfile } from '../../auth/auth-types';
import {
  RequestWithRouteAndQueryParams,
  sendResponse,
  sendUnauthorized,
} from '../../routing/route-helpers';
import {
  decryptPayloadAndValidateSessionID,
  EncryptedPayloadAndSessionID,
} from '../shared/decrypt-route-param';

function isPostiveInt(str: string) {
  return /^\d+$/.test(str);
}

type QueryParamsWithEncryptedPayload<
  QuerParamsAdditional extends qs.ParsedQs = qs.ParsedQs,
  K extends string = string,
> = {
  [key in K]: EncryptedPayloadAndSessionID;
} & QuerParamsAdditional;

export type RequestWithEncryptedPayloadParam<
  P extends ParamsDictionary,
  Q extends qs.ParsedQs = QueryParamsWithEncryptedPayload,
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
  ServiceResponse extends Promise<ApiResponse_DEPRECATED<unknown>>,
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
    res: Response
  ) {
    const authProfileAndToken = getAuth(req);

    if (!authProfileAndToken) {
      return sendUnauthorized(res);
    }

    // Get the query parameter value for the encrypted payload.
    const payloadParamValue = req.query[payloadParamName];

    const decryptResult = decryptPayloadAndValidateSessionID<QueryPayload>(
      payloadParamValue,
      authProfileAndToken
    );

    if (decryptResult.status === 'ERROR') {
      return sendResponse(res, decryptResult);
    }

    const payloadDecrypted = decryptResult.content;

    // Call the service method with the decrypted payload.
    const statusChangeResponse = await serviceMethod(
      payloadDecrypted,
      authProfileAndToken.profile,
      req
    );

    return sendResponse(res, statusChangeResponse);
  };
}
