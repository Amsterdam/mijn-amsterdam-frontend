import { NextFunction, Request, Response } from 'express';
import uid from 'uid-safe';
import {
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { OIDC_SESSION_COOKIE_NAME } from '../auth/auth-config';
import {
  getAuth,
  hasSessionCookie,
  isRequestAuthenticated,
} from '../auth/auth-helpers';
import { clearSessionCache } from '../helpers/source-api-request';
import { captureMessage } from '../services/monitoring';
import { isBlacklisted } from '../services/session-blacklist';

export async function isBlacklistedHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = await getAuth(req);
  if (auth.profile.sid) {
    const isOnList = await isBlacklisted(auth.profile.sid);
    if (isOnList) {
      return sendUnauthorized(res);
    }
  }
  return next();
}

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (hasSessionCookie(req)) {
    try {
      await getAuth(req);
      return next();
    } catch (error) {
      captureMessage('Not authenticated: Session cookie invalid', {
        severity: 'warning',
      });
    }
  }
  return sendUnauthorized(res);
}

export function verifyAuthenticated(
  authMethod: AuthMethod,
  profileType: ProfileType
) {
  return async (req: Request, res: Response) => {
    if (await isRequestAuthenticated(req, authMethod)) {
      return res.send(
        apiSuccessResult({
          isAuthenticated: true,
          profileType,
          authMethod,
        })
      );
    }
    res.clearCookie(OIDC_SESSION_COOKIE_NAME);
    return sendUnauthorized(res);
  };
}

export function apiKeyVerificationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] as string;

  const externalKeys: Array<string | undefined> = [
    process.env.BFF_EXTERNAL_CONSUMER_API_KEY_1,
    process.env.BFF_EXTERNAL_CONSUMER_API_KEY_2,
  ];

  if (apiKey && externalKeys.includes(apiKey)) {
    return next();
  }

  return sendUnauthorized(res, 'Api key ongeldig');
}

export function nocache(_req: Request, res: Response, next: NextFunction) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

export function requestID(req: Request, res: Response, next: NextFunction) {
  res.locals.requestID = uid.sync(18);
  next();
}

/** Sets the right statuscode and sends a response. */
export function sendResponse(res: Response, apiResponse: ApiResponse) {
  if (apiResponse.status === 'ERROR') {
    res.status(typeof apiResponse.code === 'number' ? apiResponse.code : 500);
  }

  return res.send(apiResponse);
}

export function sendBadRequest(
  res: Response,
  reason: string,
  content: object | string | null = null
) {
  return res
    .status(400)
    .send(apiErrorResult(`Bad request: ${reason}`, content, 400));
}

export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
) {
  res.status(401);
  return res.send(apiErrorResult(message, null, 401));
}

export function send404(res: Response) {
  res.status(404);
  return res.send(apiErrorResult('Not Found', null, 404));
}

export function clearRequestCache(req: Request, res: Response) {
  const requestID = res.locals.requestID!;
  clearSessionCache(requestID);
}

export function sendMessage(
  res: Response,
  id: string,
  event: string = 'message',
  data?: any
) {
  const doStringify = typeof data !== 'string';
  const payload = doStringify ? JSON.stringify(data) : data;
  const message = `event: ${event}\nid: ${id}\ndata: ${payload}\n\n`;
  res.write(message);
}
