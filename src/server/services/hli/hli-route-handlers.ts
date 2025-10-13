import { Request } from 'express';

import {
  blockStadspas,
  fetchStadspasBudgetTransactions,
  unblockStadspas,
} from './stadspas';
import { StadspasBudget, StadspasFrontend } from './stadspas-types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  sendResponse,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';
import { fetchDocument } from '../zorgned/zorgned-service';

type TransactionKeysEncryptedRequest = Request<{
  transactionsKeyEncrypted: StadspasFrontend['transactionsKeyEncrypted'];
}>;

export async function handleFetchTransactionsRequest(
  req: TransactionKeysEncryptedRequest,
  res: ResponseAuthenticated
) {
  const response = await fetchStadspasBudgetTransactions(
    req.params.transactionsKeyEncrypted,
    req.query.budgetCode as StadspasBudget['code'],
    res.locals.authProfileAndToken.profile.sid
  );

  return sendResponse(res, response);
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
  res: ResponseAuthenticated
) {
  const response = await blockStadspas(
    req.params.transactionsKeyEncrypted,
    res.locals.authProfileAndToken.profile.sid
  );

  return sendResponse(res, response);
}

export async function handleUnblockStadspas(
  req: TransactionKeysEncryptedRequest,
  res: ResponseAuthenticated
) {
  const response = await unblockStadspas(
    req.params.transactionsKeyEncrypted,
    res.locals.authProfileAndToken.profile.sid
  );

  return sendResponse(res, response);
}
