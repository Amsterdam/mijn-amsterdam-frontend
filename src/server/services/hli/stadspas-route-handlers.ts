import { Request, Response } from 'express';
import { apiErrorResult } from '../../../universal/helpers/api';
import { getAuth } from '../../helpers/app';
import { fetchTransacties } from './stadspas-gpass-service';

export async function handleFetchTransactionsRequest(
  req: Request,
  res: Response
) {
  const authProfileAndToken = await getAuth(req);
  const transactionKeys = req.body as string[];

  if (transactionKeys?.length) {
    const response = await fetchTransacties(
      res.locals.requestID,
      authProfileAndToken,
      transactionKeys
    );

    return res.send(response);
  }

  return res
    .status(400)
    .send(apiErrorResult('Bad request: transactions key missing', null, 400));
}
