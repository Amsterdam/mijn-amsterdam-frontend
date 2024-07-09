import { Request, Response } from 'express';
import { apiSuccessResult } from '../../../universal/helpers';
import { BffEndpoints } from '../../config';
import {
  generateFullApiUrlBFF,
  getAuth,
  sendResponseContent,
} from '../../helpers/app';
import {
  fetchDecosZaakFromSource,
  fetchDecosZakenFromSource,
} from './decos-service';
import { fetchVergunningV2 } from './vergunningen';
import { DecosZaakSource } from './config-and-types';

export async function fetchVergunningDetail(req: Request, res: Response) {
  const authProfileAndToken = await getAuth(req);
  const response = await fetchVergunningV2(
    res.locals.requestID,
    authProfileAndToken,
    req.params.id
  );

  return res.send(response);
}

export async function fetchZakenFromSource(
  req: Request<{ id?: string }>,
  res: Response
) {
  const authProfileAndToken = await getAuth(req);

  if (req.params.id) {
    const zaakResponse = await fetchDecosZaakFromSource(
      res.locals.requestID,
      req.params.id,
      true
    );
    if (zaakResponse.status === 'OK' && req.query.merge === 'true') {
      const zaak = zaakResponse.content as DecosZaakSource & {
        properties: Array<{
          field: string;
          value: unknown;
          description: string;
        }>;
      };
      const zaakMerged: Record<string, unknown> = {};
      for (const { field, description, value } of zaak.properties) {
        zaakMerged[`${field}_${description}`] = value;
      }
      return res.send(apiSuccessResult(zaakMerged));
    }
    return zaakResponse;
  }

  const zakenResponseData = await fetchDecosZakenFromSource(
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
