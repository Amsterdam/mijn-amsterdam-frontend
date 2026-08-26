import type { Request, Response } from 'express';

import {
  getOrCreateAccountData,
  updateAccountData,
} from './admin-account.model.ts';
import {
  accountUpdateInput,
  type AccountUpdateInput,
} from './admin-account.types.ts';
import type { RequestWithSession } from './admin-types.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import {
  sendBadRequestInvalidInput,
  sendResponse,
  sendServiceUnavailable,
  sendUnauthorized,
} from '../../routing/route-helpers.ts';
import { IS_DB_ENABLED } from '../db/config.ts';

function getUsernameFromSession(req: Request): string | null {
  const username = (req as RequestWithSession).session?.username;
  if (!username) {
    return null;
  }

  return username;
}

export async function getAccountDataHandler(req: Request, res: Response) {
  if (!IS_DB_ENABLED) {
    return sendServiceUnavailable(res, 'Database is disabled');
  }

  const username = getUsernameFromSession(req);

  if (!username) {
    return sendUnauthorized(res, 'Unauthorized', 'Missing account username');
  }

  const accountData = await getOrCreateAccountData(username);
  return sendResponse(res, apiSuccessResult(accountData));
}

export async function updateAccountDataHandler(req: Request, res: Response) {
  if (!IS_DB_ENABLED) {
    return sendServiceUnavailable(res, 'Database is disabled');
  }

  const username = getUsernameFromSession(req);

  if (!username) {
    return sendUnauthorized(res, 'Unauthorized', 'Missing account username');
  }

  let body: AccountUpdateInput;

  try {
    body = accountUpdateInput.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const accountData = await updateAccountData(username, body);
  return sendResponse(res, apiSuccessResult(accountData));
}
