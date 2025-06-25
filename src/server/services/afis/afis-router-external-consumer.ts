import { HttpStatusCode } from 'axios';
import express, { Request, Response } from 'express';

import { createAfisEMandate } from './afis-e-mandates';
import {
  EMandateSignRequestNotificationPayload,
  EMandateSignRequestPayload,
} from './afis-types';
import { ExternalConsumerEndpoints } from '../../routing/bff-routes';
import { createBFFRouter } from '../../routing/route-helpers';
import { captureMessage } from '../monitoring';

const routerPrivateNetwork = createBFFRouter({
  id: 'afis-external-consumer-private-network',
});

function validateAndExtractPayload(xmlPayload: string) {
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
</response>
   */
  return {
    debtornumber: 'xmlPayload.debtornumber',
    debtorIban: 'xmlPayload.iban',
    debtorBic: 'xmlPayload.bic',
    debtorAccountOwner: 'xmlPayload.bic',
    eMandateSignDate: 'xmlPayload.event_date',
  };
}

// TODO: this endpoint should be made available to the EnableU network. Find out if this is possible and how to do it.
routerPrivateNetwork.post(
  ExternalConsumerEndpoints.private.AFIS_EMANDATE_SIGN_REQUEST_STATUS_NOTIFY,
  express.raw({ type: 'text/xml' }),
  async (req: Request, res: Response) => {
    const requestBody = req.body.toString('utf-8');
    const eventPayload = validateAndExtractPayload(requestBody);

    const signRequestPayload: EMandateSignRequestPayload &
      EMandateSignRequestNotificationPayload = {
      acceptantIBAN: '', // TODO: Figure out where to get this from. Maybe in a value from the eventPayload? From a <variable2/> tag?
      businessPartnerId: eventPayload.debtornumber,
      eMandateSignDate: eventPayload.eMandateSignDate,
      senderIBAN: eventPayload.debtorIban,
      senderBIC: eventPayload.debtorBic,
      senderName: eventPayload.debtorAccountOwner,
    };

    // TODO: Figure out if we can actually create the eMandate from this event.
    const createEmandateResponse = await createAfisEMandate(signRequestPayload);

    const isOK = createEmandateResponse.status === 'OK';

    res.status(isOK ? HttpStatusCode.Ok : HttpStatusCode.InternalServerError);

    if (!isOK && createEmandateResponse.status === 'ERROR') {
      // TODO: Add this message to observability. We need to know be notified when this happens.
      // Maybe send an email to FB?
      captureMessage(
        `Error in sign request status notify endpoint: ${createEmandateResponse.message}`
      );
    }

    // TODO: Maybe POM needs a specific request status text?
    return res.send(isOK ? 'OK' : 'ERROR');
  }
);

export const afisExternalConsumerRouter = {
  private: routerPrivateNetwork,
};
