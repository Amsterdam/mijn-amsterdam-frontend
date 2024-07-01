import { Request, Response } from 'express';
import { getAuth, sendResponseContent } from '../../helpers/app';
import { fetchVergunningDocumentV2, fetchVergunningV2 } from './vergunningen';
import { IS_TEST } from '../../../universal/config';
import { fetchDecosVergunningenSource } from './decos-service';

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

export async function fetchZakenSource(
  req: Request<{ props?: 'true' }>,
  res: Response
) {
  const authProfileAndToken = await getAuth(req);
  return sendResponseContent(
    res,
    await fetchDecosVergunningenSource(
      res.locals.requestID,
      authProfileAndToken,
      req.query.props === 'true'
    )
  );
}
