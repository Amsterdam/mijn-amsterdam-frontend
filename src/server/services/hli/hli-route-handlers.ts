import { Request, Response } from 'express';

import { fetchStadspasBudgetTransactions } from './stadspas';
import { blockStadspas } from './stadspas-gpass-service';
import { StadspasBudget, TransactionKeysEncrypted } from './stadspas-types';
import { getAuth } from '../../auth/auth-helpers';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { sendResponse, sendUnauthorized } from '../../routing/route-helpers';
import { fetchDocument } from '../zorgned/zorgned-service';

type TransactionKeysEncryptedRequest = Request<{
  transactionsKeyEncrypted: TransactionKeysEncrypted;
}>;

export async function handleFetchTransactionsRequest(
  req: TransactionKeysEncryptedRequest,
  res: Response
) {
  const authProfileAndToken = getAuth(req);
  if (authProfileAndToken) {
    const response = await fetchStadspasBudgetTransactions(
      res.locals.requestID,
      req.params.transactionsKeyEncrypted,
      req.query.budgetCode as StadspasBudget['code'],
      authProfileAndToken.profile.sid
    );

    return sendResponse(res, response);
  }
  return sendUnauthorized(res);
}

export async function fetchZorgnedAVDocument(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const response = fetchDocument(
    requestID,
    authProfileAndToken,
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
    res.locals.requestID,
    req.params.transactionsKeyEncrypted,
    authProfileAndToken.profile.sid
  );

  return sendResponse(res, response);
}
