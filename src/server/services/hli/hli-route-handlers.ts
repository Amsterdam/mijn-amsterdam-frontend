import { Request, Response } from 'express';
import { AuthProfileAndToken, getAuth, sendResponse } from '../../helpers/app';
import { fetchDocument } from '../zorgned/zorgned-service';
import { fetchStadspasBudgetTransactions } from './stadspas';
import { StadspasBudget, StadspasFrontend } from './stadspas-types';

export async function handleFetchTransactionsRequest(
  req: Request<{
    transactionsKeyEncrypted: StadspasFrontend['transactionsKeyEncrypted'];
  }>,
  res: Response
) {
  const authProfileAndToken = await getAuth(req);
  const response = await fetchStadspasBudgetTransactions(
    res.locals.requestID,
    req.params.transactionsKeyEncrypted,
    req.query.budgetCode as StadspasBudget['code'],
    authProfileAndToken.profile.sid
  );

  return sendResponse(res, response);
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
