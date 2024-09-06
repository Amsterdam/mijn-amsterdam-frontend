import { Request, Response } from 'express';
import {
  fetchAfisBusinessPartnerDetails,
  fetchAfisFacturen,
  fetchAfisInvoiceDocumentContent,
  fetchAfisClosedInvoices,
  AfisFacturenQueryParams,
} from './afis';
import {
  getAuth,
  send404,
  sendBadRequest,
  sendResponse,
  sendUnauthorized,
} from '../../helpers/app';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisFactuurState,
} from './afis-types';
import { decrypt } from '../../helpers/encrypt-decrypt';
import { captureException } from '../monitoring';
import { decryptAndValidate } from '../shared/decrypt-route-param';

export async function handleFetchAfisBusinessPartner(
  req: Request<{ businessPartnerIdEncrypted: string }>,
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

function isPostiveInt(str: string): boolean {
  return /^\d+$/.test(str);
}

/** Route handler to get a series of invoices (facturen) from AFIS (SAP)
 *
 *  # Optional query parameters
 *
 *  top: The maximum amount of invoices.
 *    for example `$top=4` will get you four invoices out of potentially 200.
 */
export async function handleFetchAfisFacturen(
  req: Request<{ businessPartnerIdEncrypted: string; state: AfisFactuurState }>,
  res: Response
) {
  const authProfileAndToken = await getAuth(req);
  const decryptResponse = decryptAndValidate(
    req.params.businessPartnerIdEncrypted,
    authProfileAndToken
  );

  if (decryptResponse.status === 'ERROR') {
    return decryptResponse;
  }

  const businessPartnerID = decryptResponse.content;
  let top = req.query?.top;
  if (typeof top !== 'string' || !isPostiveInt(top)) {
    top = undefined;
  }

  let queryParams: AfisFacturenQueryParams;

  const state = req.params.state;
  if (state === 'open') {
    queryParams = {
      filter: `$filter=Customer eq '${businessPartnerID}' and IsCleared eq false and (DunningLevel eq '0' or DunningBlockingReason eq 'D')`,
      select:
        '$select=Paylink,PostingDate,ProfitCenterName,InvoiceNo,AmountInBalanceTransacCrcy,NetPaymentAmount,NetDueDate,DunningLevel,DunningBlockingReason,SEPAMandate&$orderBy=NetDueDate asc, PostingDate asc',
      orderBy: '$orderBy=NetDueDate asc, PostingDate asc',
      top,
    };
  } else if (state === 'closed') {
    queryParams = {
      filter: `&$filter=Customer eq '${businessPartnerID}' and IsCleared eq true and (DunningLevel eq '0' or ReverseDocument ne '')`,
      select:
        '$select=ReverseDocument,ProfitCenterName,DunningLevel,InvoiceNo,NetDueDate',
      orderBy: '$orderBy=NetDueDate desc',
      top,
    };
  } else {
    return send404(res);
  }

  const response = await fetchAfisFacturen(
    res.locals.requestID,
    authProfileAndToken,
    queryParams
  );
  return sendResponse(res, response);
}

export async function handleFetchAfisDocument(
  req: Request<{ archiveDocumentId: string }>,
  res: Response
) {
  // const response = await fetchAfisInvoiceDocumentContent(
  //   res.locals.requestID,
  //   req.params.archiveDocumentId
  // );
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
