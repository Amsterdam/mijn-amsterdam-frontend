import express, { Request, Response } from 'express';

import { createAfisEMandate } from './afis-e-mandates';
import {
  EMandateSignRequestNotificationPayload,
  EMandateSignRequestPayload,
} from './afis-types';
import { HTTP_STATUS_CODES } from '../../../universal/constants/errorCodes';
import { ExternalConsumerEndpoints } from '../../routing/bff-routes';
import { captureMessage } from '../monitoring';

export const routerPrivateNetwork = express.Router();
routerPrivateNetwork.BFF_ID = 'afis-external-consumer-private-network';

function validateAndExtractPayload(xmlPayload: string) {
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
  async (req: Request, res: Response) => {
    const eventPayload = validateAndExtractPayload(req.body);

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
    const createEmandateResponse = await createAfisEMandate(
      res.locals.requestID,
      signRequestPayload
    );

    const isOK = createEmandateResponse.status === 'OK';

    res.status(
      isOK ? HTTP_STATUS_CODES.OK : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );

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
