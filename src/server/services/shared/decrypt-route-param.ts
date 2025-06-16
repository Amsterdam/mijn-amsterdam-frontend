import { HttpStatusCode } from 'axios';

import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { decrypt } from '../../helpers/encrypt-decrypt';
import { logger } from '../../logging';
import { captureException } from '../monitoring';

export type SessionIDAndROuteParamIdEncrypted = string;

/** Decrypt an encrypted 'sessionid:id' and validate it.
 */
export function decryptEncryptedRouteParamAndValidateSessionID<
  T extends string = string,
>(
  sessionIDAndRouteParamIdEncrypted: SessionIDAndROuteParamIdEncrypted,
  authProfileAndToken: AuthProfileAndToken
) {
  let sessionID: SessionID | null = null;
  let id: string | null = null;
  try {
    [sessionID, id] = decrypt(sessionIDAndRouteParamIdEncrypted).split(':');
  } catch (error) {
    logger.error(error);
    captureException(error);
    return apiErrorResult(
      'Bad request: failed to process encrypted param',
      null,
      HttpStatusCode.BadRequest
    );
  }

  if (!sessionID || !id || authProfileAndToken.profile.sid !== sessionID) {
    logger.error(
      {
        sessionID,
        routeParamID: id,
        sidProfile: authProfileAndToken.profile.sid,
      },
      'Incomplete session validation or missing routeParamID'
    );
    return apiErrorResult(
      'Not authorized: incomplete session validation',
      null,
      HttpStatusCode.Unauthorized
    );
  }

  return apiSuccessResult<T>(id as T);
}

export function decryptPayloadAndValidateSessionID<
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  payloadEncrypted: EncryptedPayloadAndSessionID,
  authProfileAndToken: AuthProfileAndToken
) {
  let payload: DecryptedPayloadAndSessionID<T> | null = null;

  try {
    payload = JSON.parse(decrypt(payloadEncrypted));
  } catch (error) {
    console.error(error);
    captureException(error);
    return apiErrorResult(
      'Bad request: failed to process encrypted param',
      null,
      HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  if (
    !payload ||
    !payload.sessionID ||
    authProfileAndToken.profile.sid !== payload.sessionID
  ) {
    if (IS_DEBUG) {
      console.debug('Incomplete session validation');
    }
    return apiErrorResult(
      'Not authorized: incomplete session validation or missing payload',
      null,
      HTTP_STATUS_CODES.UNAUTHORIZED
    );
  }

  return apiSuccessResult<T>(payload);
}
