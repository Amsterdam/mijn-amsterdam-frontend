import { apiErrorResult, apiSuccessResult } from '../../../universal/helpers';
import { decrypt } from '../../../universal/helpers/encrypt-decrypt';
import { AuthProfileAndToken } from '../../helpers/app';
import { captureException } from '../monitoring';

export function decryptAndValidate(
  idEncrypted: string,
  authProfileAndToken: AuthProfileAndToken
) {
  let sessionID: AuthProfileAndToken['profile']['sid'] | null = null;
  let id: string | null = null;

  try {
    [sessionID, id] = decrypt(idEncrypted).split(':');
  } catch (error) {
    captureException(error);
    return apiErrorResult(
      'Bad request: failed to process encrypted param',
      null,
      400
    );
  }

  if (!sessionID || !id || authProfileAndToken.profile.sid !== sessionID) {
    return apiErrorResult(
      'Not authorized: incomplete session validation',
      null,
      401
    );
  }

  return apiSuccessResult(id);
}
