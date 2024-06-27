import { Request, Response } from 'express';
import { getAuth, sendResponseContent } from '../../helpers/app';
import { fetchVergunningDocumentV2, fetchVergunningV2 } from './vergunningen';

export async function fetchVergunningDetail(req: Request, res: Response) {
  const authProfileAndToken = await getAuth(req);
  const response = await fetchVergunningV2(
    res.locals.requestID,
    authProfileAndToken,
    req.params.id
  );

  return res.send(response);
}

export async function fetchVergunningDocument(
  req: Request<{ id: string }>,
  res: Response
) {
  const authProfileAndToken = await getAuth(req);
  const apiResponse = await fetchVergunningDocumentV2(
    res.locals.requestID,
    authProfileAndToken,
    req.params.id
  );

  return sendResponseContent(res, apiResponse);
}
