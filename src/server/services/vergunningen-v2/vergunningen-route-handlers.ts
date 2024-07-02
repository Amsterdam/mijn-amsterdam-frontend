import { Request, Response } from 'express';
import { apiSuccessResult } from '../../../universal/helpers';
import { BffEndpoints } from '../../config';
import {
  generateFullApiUrlBFF,
  getAuth,
  sendResponseContent,
} from '../../helpers/app';
import { fetchDecosZaakSource, fetchDecosZakenSource } from './decos-service';
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

  if (apiResponse.status === 'ERROR') {
    return sendResponseContent(res, apiResponse);
  }

  apiResponse.data.pipe(res);
}

export async function fetchZakenSource(
  req: Request<{ id?: string }>,
  res: Response
) {
  const authProfileAndToken = await getAuth(req);

  if (req.params.id) {
    return res.send(
      await fetchDecosZaakSource(res.locals.requestID, req.params.id, true)
    );
  }

  const zakenResponseData = await fetchDecosZakenSource(
    res.locals.requestID,
    authProfileAndToken
  );

  if (zakenResponseData.status === 'OK') {
    const links = [];
    for (const zaak of zakenResponseData.content) {
      const url = generateFullApiUrlBFF(
        BffEndpoints.VERGUNNINGENv2_ZAKEN_SOURCE,
        {
          id: zaak.key,
        }
      );
      links.push(`${url}`);
    }
    return res.send(apiSuccessResult(links));
  }
  return res.send(zakenResponseData);
}
