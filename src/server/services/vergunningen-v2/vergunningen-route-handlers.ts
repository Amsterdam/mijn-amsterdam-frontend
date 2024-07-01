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
  req: Request<{ props?: 'true'; merged?: 'true' }>,
  res: Response
) {
  const authProfileAndToken = await getAuth(req);
  let responseData: any = await fetchDecosVergunningenSource(
    res.locals.requestID,
    authProfileAndToken,
    req.query.props === 'true'
  );
  if (req.query.merged === 'true') {
    responseData = responseData.content.reduce(
      (acc: any, { field, value, description }: any) => {
        acc[`${field}_${description}`] = value;
        return acc;
      },
      {}
    );
  }
  return sendResponseContent(res, responseData);
}
