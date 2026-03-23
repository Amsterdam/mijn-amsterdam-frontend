import type { Request } from 'express';

import { ZORGNED_AV_API_CONFIG_KEY } from './hli-service-config.ts';
import type { StadspasBudget, StadspasFrontend } from './stadspas-types.ts';
import {
  blockStadspas,
  fetchStadspasBudgetTransactions,
  unblockStadspas,
} from './stadspas.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import {
  sendResponse,
  type ResponseAuthenticated,
} from '../../routing/route-helpers.ts';
import { fetchAanvragenRaw, fetchDocument } from '../zorgned/zorgned-service.ts';

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
    ZORGNED_AV_API_CONFIG_KEY,
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

export async function fetchZorgnedAVAanvragen(
  req: Request,
  res: ResponseAuthenticated
) {
  const response = await fetchAanvragenRaw(res.locals.userID, {
    zorgnedApiConfigKey: ZORGNED_AV_API_CONFIG_KEY,
  });

  return sendResponse(res, response);
}
