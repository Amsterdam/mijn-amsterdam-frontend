import createDebugger from 'debug';
import { Request, Response } from 'express';

import {
  createVerificationRequest,
  verifyVerificationRequest,
} from './contact-verify';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { getAuth } from '../../auth/auth-helpers';
import { requestData } from '../../helpers/source-api-request';
import {
  sendBadRequest,
  sendResponse,
  sendUnauthorized,
} from '../../routing/route-helpers';
import { fetchPersoonsgegevensNAW } from '../zorgned/zorgned-service';

const debugContactRequestData = createDebugger(
  'contact-api:route-request-data'
);

export async function handleCreateVerificationRequest(
  req: Request,
  res: Response
) {
  debugContactRequestData(req.body);

  // return res.send(apiSuccessResult({ ok: true }));
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const { email } = req.body;

  if (!email) {
    return sendBadRequest(res, 'E-mail is required');
  }

  const response = await createVerificationRequest(authProfileAndToken, {
    email,
  });

  return sendResponse(res, response);
}

export async function handleVerifyVerificationRequest(
  req: Request,
  res: Response
) {
  debugContactRequestData(req.body);

  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return sendBadRequest(res, 'E-mail and code are required');
  }

  const response = await verifyVerificationRequest(authProfileAndToken, {
    email,
    code,
  });

  return sendResponse(res, response);
}

export async function handleGetEmail(req: Request, res: Response) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const USE_CACHED = false;

  const response = await fetchPersoonsgegevensNAW(
    authProfileAndToken.profile.id,
    'ZORGNED_JZD',
    USE_CACHED
  );

  if (response.status !== 'OK') {
    return sendResponse(res, response);
  }

  const contactResponse = apiSuccessResult({
    email: response.content?.persoon?.email ?? null,
  });

  return sendResponse(res, contactResponse);
}

export type ContactResponse = { email: string | null };

export async function handleUpdateEmail(req: Request, res: Response) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const { email } = req.body;

  if (typeof email === 'undefined') {
    return sendBadRequest(res, 'E-mail is required');
  }

  const response = await requestData({
    url: 'http://localhost:3100/mocks-api/zorgned/client-data',
    data: { email },
    method: 'POST',
  });

  return sendResponse(res, response);
}
