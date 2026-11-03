import createDebugger from 'debug';
import type { Request } from 'express';

import {
  type ResponseAuthenticated,
  sendBadRequest,
  sendBadRequestInvalidInput,
  sendResponse,
} from '../../routing/route-helpers.ts';
import {
  ContactgegevenTypes,
  ContactgegevenTypeValues,
  fetchCommunicatievoorkeuren,
} from './klantcontact-communicatievoorkeuren.ts';
import {
  createContactgegeven,
  deleteContactgegeven,
  fetchDienstverlener,
  verifyContactgegeven,
} from './klantcontact-profieldienst.ts';

const debugContactRequestData = createDebugger(
  'contact-api:route-request-data'
);

export async function handleVerifyContactgegeven(
  req: Request,
  res: ResponseAuthenticated
) {
  debugContactRequestData(req.body);

  const { value, code, type } = req.body;

  if (!value || !code || type !== ContactgegevenTypes.Email) {
    return sendBadRequest(res, 'value, type and code are required');
  }

  const response = await verifyContactgegeven(res.locals.authProfileAndToken, {
    type,
    value,
    code,
  });

  return sendResponse(res, response);
}

export async function handleFetchCommunicatievoorkeuren(
  _req: Request,
  res: ResponseAuthenticated
) {
  const communicatievoorkeurenResponse = await fetchCommunicatievoorkeuren(
    res.locals.authProfileAndToken
  );

  return sendResponse(res, communicatievoorkeurenResponse);
}

export async function handleCreateContactgegeven(
  req: Request,
  res: ResponseAuthenticated
) {
  const { value, type } = req.body;

  if (!ContactgegevenTypeValues.includes(type) || !value) {
    return sendBadRequestInvalidInput(
      res,
      `payloadType ${type} is not supported`
    );
  }

  const response = await createContactgegeven(
    res.locals.authProfileAndToken,
    type,
    value
  );

  return sendResponse(res, response);
}

export async function handleDeleteContactgegeven(
  req: Request,
  res: ResponseAuthenticated
) {
  const { id } = req.body;

  if (!id) {
    return sendBadRequest(res, 'Contactgegeven ID is required');
  }

  const response = await deleteContactgegeven(
    res.locals.authProfileAndToken,
    id
  );

  return sendResponse(res, response);
}

export async function handleFetchDienstverlener(
  req: Request,
  res: ResponseAuthenticated
) {
  const { naam } = req.params as { naam?: string };
  const response = await fetchDienstverlener(
    res.locals.authProfileAndToken,
    naam
  );
  return sendResponse(res, response);
}
