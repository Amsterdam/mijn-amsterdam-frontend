import type { Request, Response } from 'express';

import {
  getOrCreateAccountData,
  updateAccountData,
} from './admin-account.model.ts';
import {
  accountUpdateInput,
  type AccountUpdateInput,
} from './admin-account.types.ts';
import { getUsernameFromSession } from './admin-helpers.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import {
  sendBadRequestInvalidInput,
  sendResponse,
} from '../../routing/route-helpers.ts';

export async function getAccountDataHandler(req: Request, res: Response) {
  const username = getUsernameFromSession(req);
  const accountData = await getOrCreateAccountData(username);

  return sendResponse(res, apiSuccessResult(accountData));
}

export async function updateAccountDataHandler(req: Request, res: Response) {
  let body: AccountUpdateInput;

  try {
    body = accountUpdateInput.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const username = getUsernameFromSession(req);
  const accountData = await updateAccountData(username, body);
  return sendResponse(res, apiSuccessResult(accountData));
}
