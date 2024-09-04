import { Request, Response } from 'express';
import {
  fetchAfisBusinessPartnerDetails,
  fetchAfisOpenInvoices,
  fetchAfisInvoiceDocumentContent,
  fetchAfisInvoiceDocumentID,
  fetchAfisClosedInvoices,
} from './afis';
import {
  send404,
  sendBadRequest,
  sendResponse,
  sendUnauthorized,
} from '../../helpers/app';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisInvoiceState,
} from './afis-types';
import { decrypt } from '../../helpers/encrypt-decrypt';
import { captureException } from '../monitoring';

type BaseParams = {
  businessPartnerIdEncrypted: string;
};

export async function handleFetchAfisBusinessPartner(
  req: Request<BaseParams>,
  res: Response
) {
  const handler = async (
    _req: Request,
    res: Response,
    businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId']
  ) => {
    const response = await fetchAfisBusinessPartnerDetails(businessPartnerId);

    return sendResponse(res, response);
  };

  return fetchWithEncryptedBusinessPartnerID(handler, req, res);
}

/** Route handler to get a series of invoices (facturen) from AFIS (SAP)
 *
 *  # Optional query parameters
 *
 *  top: The maximum amount of invoices.
 *    for example `$top=4` will get you four invoices out of potentially 200.
 */
export async function handleFetchAfisFacturen(
  req: Request<BaseParams & { state: AfisInvoiceState }>,
  res: Response
) {
  const handler = async (
    req: Request,
    res: Response,
    businessPartnerID: AfisBusinessPartnerDetailsTransformed['businessPartnerId']
  ) => {
    const state = req.params.state;
    let top: number | undefined = undefined;

    const t = req.query.top;
    if (t) {
      try {
        top = parseInt(t.toString(), 10);
      } catch (error) {
        captureException(error);
        return sendBadRequest(
          res,
          'Something went wrong parsing query paremeter $top'
        );
      }
      if (top <= 0) {
        return sendBadRequest(
          res,
          `Incorrect query parameter '$top=${t}', make sure top is a numerical string > 1.`
        );
      }
    }

    switch (state) {
      case 'open': {
        const response = await fetchAfisOpenInvoices(
          res.locals.requestID,
          businessPartnerID,
          top
        );
        return sendResponse(res, response);
      }
      case 'closed': {
        const response = await fetchAfisClosedInvoices(
          res.locals.requestID,
          businessPartnerID,
          top
        );
        return sendResponse(res, response);
      }
      default: {
        return send404(res);
      }
    }
  };

  return await fetchWithEncryptedBusinessPartnerID(handler, req, res);
}

export async function handleFetchAfisDocument(
  req: Request<{ archiveDocumentId: string }>,
  res: Response
) {
  const response = await fetchAfisInvoiceDocumentContent(
    res.locals.requestID,
    req.params.archiveDocumentId
  );
  // return sendResponse(res, response);
}

async function fetchWithEncryptedBusinessPartnerID<T>(
  handler: (
    req: Request,
    res: Response,
    businessPartnerID: AfisBusinessPartnerDetailsTransformed['businessPartnerId']
  ) => T,
  req: Request,
  res: Response
) {
  let businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId'];
  try {
    businessPartnerId = parseInt(
      decrypt(req.params.businessPartnerIdEncrypted),
      10
    );
  } catch (error) {
    return sendUnauthorized(res);
  }

  return await handler(req, res, businessPartnerId);
}
