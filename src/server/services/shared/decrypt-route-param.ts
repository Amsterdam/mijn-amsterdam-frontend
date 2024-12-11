import { HTTP_STATUS_CODES } from '../../../universal/constants/errorCodes';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { IS_DEBUG } from '../../config/app';
import { decrypt } from '../../helpers/encrypt-decrypt';
import { captureException } from '../monitoring';

export type SessionIDAndROuteParamIdEncrypted = string;
export type EncryptedPayloadAndSessionID = string;

export type DecryptedPayloadAndSessionID<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  sessionID: string;
} & T;

/** Decrypt an encrypted 'sessionid:id' and validate it.
 */
export function decryptEncryptedRouteParamAndValidateSessionID<
  T extends string = string,
>(
  sessionIDAndRouteParamIdEncrypted: SessionIDAndROuteParamIdEncrypted,
  authProfileAndToken: AuthProfileAndToken
) {
  let sessionID: SessionID | null = null;
  let routeParamValue: string | null = null;

  try {
    [sessionID, routeParamValue] = decrypt(
      sessionIDAndRouteParamIdEncrypted
    ).split(':');
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
    !sessionID ||
    !routeParamValue ||
    authProfileAndToken.profile.sid !== sessionID
  ) {
    if (IS_DEBUG) {
      console.log(
        'ERROR: Incomplete session validation or missing routeParamID',
        'sessionID:',
        sessionID,
        'routeParamID:',
        routeParamValue,
        'profile.sid:',
        authProfileAndToken.profile.sid
      );
    }
    return apiErrorResult(
      'Not authorized: incomplete session validation',
      null,
      HTTP_STATUS_CODES.UNAUTHORIZED
    );
  }

  return apiSuccessResult<T>(routeParamValue as T);
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
