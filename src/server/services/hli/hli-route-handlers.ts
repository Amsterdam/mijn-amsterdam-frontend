import { Request, Response } from 'express';

import {
  blockStadspas,
  fetchStadspasBudgetTransactions,
  unblockStadspas,
} from './stadspas.ts';
import { StadspasBudget, StadspasFrontend } from './stadspas-types.ts';
import { getAuth } from '../../auth/auth-helpers.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { sendResponse, sendUnauthorized } from '../../routing/route-helpers.ts';
import { fetchDocument } from '../zorgned/zorgned-service.ts';

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
  const response = fetchDocument(
    authProfileAndToken.profile.id,
    'ZORGNED_AV',
    documentId
  );
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
