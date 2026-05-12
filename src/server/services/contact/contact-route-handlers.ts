import createDebugger from 'debug';
import type { Request } from 'express';

import {
  createVerificationRequest,
  verifyVerificationRequest,
} from './contact-verify.ts';
import {
  sendBadRequest,
  sendResponse,
  type ResponseAuthenticated,
} from '../../routing/route-helpers.ts';
import { captureException } from '../monitoring.ts';
import {
  fetchCommunicatievoorkeuren,
  fetchDienstverlener,
  setContactgegeven,
} from './contact-profieldienst.ts';

const debugContactRequestData = createDebugger(
  'contact-api:route-request-data'
);

export async function handleCreateVerificationRequest(
  req: Request,
  res: ResponseAuthenticated
) {
  debugContactRequestData(req.body);

  const { email, phone } = req.body;

  if (!email && !phone) {
    return sendBadRequest(res, 'E-mail or phone is required');
  }

  try {
    const response = await createVerificationRequest(
      res.locals.authProfileAndToken,
      {
        email,
        phone,
      }
    );
    return sendResponse(res, response);
  } catch (error) {
    captureException(error);
    return sendBadRequest(res, 'Failed to create verification request');
  }
}

export async function handleVerifyVerificationRequest(
  req: Request,
  res: ResponseAuthenticated
) {
  debugContactRequestData(req.body);

  const { email, code } = req.body;

  if (!email || !code) {
    return sendBadRequest(res, 'E-mail and code are required');
  }

  const response = await verifyVerificationRequest(
    res.locals.authProfileAndToken,
    {
      email,
      code,
    }
  );

  return sendResponse(res, response);
}

export async function handleGetCommunicatievoorkeuren(
  req: Request,
  res: ResponseAuthenticated
) {
  const communicatievoorkeurenResponse = await fetchCommunicatievoorkeuren(
    res.locals.authProfileAndToken
  );

  return sendResponse(res, communicatievoorkeurenResponse);
}

export async function handleSetContactgegeven(
  req: Request,
  res: ResponseAuthenticated
) {
  const { value, type, serviceId, voorkeurId } = req.body;

  // TODO: Use ZOD
  // if (typeof email === 'undefined') {
  //   return sendBadRequest(res, 'E-mail is required');
  // }

  const response = await setContactgegeven(
    res.locals.authProfileAndToken,
    type,
    value,
    serviceId,
    voorkeurId
  );

  return sendResponse(res, response);
}

export async function handleGetDienstverlener(
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
