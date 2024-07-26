import { Request, Response } from 'express';
import { getAuth } from '../../helpers/app';
import { fetchStadspasTransactions } from './stadspas';
import { StadspasBudget } from './stadspas-types';
import { fetchDocument } from '../zorgned/zorgned-service';

export async function handleFetchTransactionsRequest(
  req: Request<{ transactionsKeyEncrypted: string }>,
  res: Response
) {
  const authProfileAndToken = await getAuth(req);

  const response = await fetchStadspasTransactions(
    res.locals.requestID,
    req.params.transactionsKeyEncrypted,
    req.query.budgetCode as StadspasBudget['code'],
    authProfileAndToken.profile.sid
  );

  if (response.status === 'ERROR') {
    res.status(typeof response.code === 'number' ? response.code : 500);
  }

  return res.send(response);
}

export async function fetchZorgnedAVDocument(
  requestID: requestID,
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
