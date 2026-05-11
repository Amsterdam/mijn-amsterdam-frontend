import createDebugger from 'debug';
import { Request, Response } from 'express';

import {
  createVerificationRequest,
  verifyVerificationRequest,
} from './contact-verify';
import { getAuth } from '../../auth/auth-helpers';
import {
  sendBadRequest,
  sendResponse,
  sendUnauthorized,
} from '../../routing/route-helpers';

const debugVerifyRouteRequestData = createDebugger(
  'verify-api:route-request-data'
);

export async function handleCreateVerificationRequest(
  req: Request,
  res: Response
) {
  debugVerifyRouteRequestData(req.body);

  // return res.send(apiSuccessResult({ ok: true }));
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const { email } = req.body;

  if (!email) {
    return sendBadRequest(res, 'Email is required');
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
  debugVerifyRouteRequestData(req.body);

  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return sendBadRequest(res, 'Email and code are required');
  }

  const response = await verifyVerificationRequest(authProfileAndToken, {
    email,
    code,
  });

  return sendResponse(res, response);
}
