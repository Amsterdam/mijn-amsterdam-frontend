import { HttpStatusCode } from 'axios';
import express, { Request, Response, type NextFunction } from 'express';
import { XMLParser } from 'fast-xml-parser';

import { createAfisEMandate } from './afis-e-mandates';
import type {
  EMandateSignRequestPayload,
  EMandateSignRequestNotificationPayload,
  POMEMandateSignRequestPayloadTransformed,
  POMEMandateSignRequestPayloadFromXML,
} from './afis-types';
import type { ApiResponse } from '../../../universal/helpers/api';
import { ExternalConsumerEndpoints } from '../../routing/bff-routes';
import { createBFFRouter } from '../../routing/route-helpers';
import { captureException } from '../monitoring';

const routerPrivateNetwork = createBFFRouter({
  id: 'afis-external-consumer-private-network',
});

function validateAndExtractPayload(
  xmlPayload: Buffer
): POMEMandateSignRequestPayloadTransformed {
  /**
<?xml version="1.0"?>
<response>
  <id_client>1000</id_client>
  <debtornumber>123456</debtornumber>
  <cid>2345678910</cid>
  <mpid>1234567890</mpid>
  <payment_reference>123456789</payment_reference>
  <id_request_client>test</id_request_client>
  <event_type>payment</event_type>
  <amount_total>45500</amount_total>
  <id_bank>ABNANL2A</id_bank>
  <iban>GB33BUKB20201555555555</iban>
  <bic>INGBNL2A</bic>
  <account_owner>John Doe</account_owner>
  <event_date>2024-01-05</event_date>
  <event_time>11:27</event_time>

  <variable1>NL21RABO0110055004</variable1> // Acceptant IBAN (Gemeente Amsterdam Afval) --> UNKNOWN, find out how to get this.
</response>
   */
  const parser = new XMLParser();
  const { response } = parser.parse(xmlPayload);
  const payload = response as POMEMandateSignRequestPayloadFromXML;

  return {
    debtornumber: payload.debtornumber.toString(),
    debtorIBAN: payload.iban,
    debtorBIC: payload.bic,
    debtorAccountOwner: payload.account_owner,
    eMandateSignDate: `${payload.event_date}T${payload.event_time}:00Z`, // ISO 8601 format
    acceptantIBAN: payload.variable1,
  };
}

async function handleAfisEMandateSignRequestStatusNotify(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const notificationPayload = validateAndExtractPayload(req.body);

  const signRequestPayload: EMandateSignRequestPayload &
    EMandateSignRequestNotificationPayload = {
    acceptantIBAN: notificationPayload.acceptantIBAN, // TODO: Figure out where to get this from. Maybe in a value from the eventPayload? From a <variable1/> tag?
    businessPartnerId: notificationPayload.debtornumber,
    eMandateSignDate: notificationPayload.eMandateSignDate,
    senderIBAN: notificationPayload.debtorIBAN,
    senderBIC: notificationPayload.debtorBIC,
    senderName: notificationPayload.debtorAccountOwner,
  };

  let createEmandateResponse: ApiResponse<unknown> | null = null;

  // TODO: Figure out if we can actually create the eMandate from this event.
  try {
    createEmandateResponse = await createAfisEMandate(signRequestPayload);
  } catch (error) {
    // If the eMandate creation fails, we should log the error and return an error response.
    // This is important for observability and debugging.
    captureException(error);
    res.status(HttpStatusCode.InternalServerError);
    return res.send('ERROR');
  }

  const isOK = createEmandateResponse !== null;

  res.status(isOK ? HttpStatusCode.Ok : HttpStatusCode.InternalServerError);

  // TODO: Maybe POM needs a specific request status text?
  return res.send(isOK ? 'OK' : 'ERROR');
}

// TODO: this endpoint should be made available to the EnableU network. Find out if this is possible and how to do it.
routerPrivateNetwork.post(
  ExternalConsumerEndpoints.private.AFIS_EMANDATE_SIGN_REQUEST_STATUS_NOTIFY,
  express.raw({ type: 'text/xml' }),
  handleAfisEMandateSignRequestStatusNotify
);

export const afisExternalConsumerRouter = {
  private: routerPrivateNetwork,
};

export const forTesting = {
  validateAndExtractPayload,
  handleAfisEMandateSignRequestStatusNotify,
};
