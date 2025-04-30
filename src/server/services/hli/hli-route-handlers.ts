import { Request, Response } from 'express';

import {
  blockStadspas,
  fetchStadspasBudgetTransactions,
  unblockStadspas,
} from './stadspas';
import { StadspasBudget, StadspasFrontend } from './stadspas-types';
import { getAuth } from '../../auth/auth-helpers';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { sendResponse, sendUnauthorized } from '../../routing/route-helpers';
import { fetchDocument } from '../zorgned/zorgned-service';

type TransactionKeysEncryptedRequest = Request<{
  transactionsKeyEncrypted: StadspasFrontend['transactionsKeyEncrypted'];
}>;

export async function handleFetchTransactionsRequest(
  req: TransactionKeysEncryptedRequest,
  res: Response
) {
  const authProfileAndToken = getAuth(req);
  if (authProfileAndToken) {
    const response = await fetchStadspasBudgetTransactions(
      req.params.transactionsKeyEncrypted,
      req.query.budgetCode as StadspasBudget['code'],
      authProfileAndToken.profile.sid
    );

    return sendResponse(res, response);
  }
  return sendUnauthorized(res);
}

export async function fetchZorgnedAVDocument(
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const response = fetchDocument(authProfileAndToken, 'ZORGNED_AV', documentId);
  return response;
}

export async function handleBlockStadspas(
  req: TransactionKeysEncryptedRequest,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const response = await blockStadspas(
    req.params.transactionsKeyEncrypted,
    authProfileAndToken.profile.sid
  );

  return sendResponse(res, response);
}

export async function handleUnblockStadspas(
  req: TransactionKeysEncryptedRequest,
  res: Response
) {
  const authProfileAndToken = getAuth(req);

  if (!authProfileAndToken) {
    return sendUnauthorized(res);
  }

  const response = await unblockStadspas(
    req.params.transactionsKeyEncrypted,
    authProfileAndToken.profile.sid
  );

  return sendResponse(res, response);
}
