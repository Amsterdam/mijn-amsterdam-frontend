import { ZORGNED_AV_API_CONFIG_KEY } from './hli-service-config.ts';
import { AV_CZM } from './status-line-items/regeling-czm.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { isDateInPast } from '../../../universal/helpers/date.ts';
import {
  fetchAanvragenWithRelatedPersons,
  fetchPersoonsgegevensNAW,
} from '../zorgned/zorgned-service.ts';
import type {
  ZorgnedAanvraagTransformed,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedPersoonsgegevensNAWResponse} from '../zorgned/zorgned-types.ts';
import {
  ZORGNED_GEMEENTE_CODE,
  type BSN,
} from '../zorgned/zorgned-types.ts';

function transformToAdministratienummer(identificatie: number): string {
  const padLength = 10;
  const clientnummerPadded = String(identificatie).padStart(padLength, '0');
  const administratienummer = `${ZORGNED_GEMEENTE_CODE}${clientnummerPadded}`;
  return administratienummer;
}

function transformZorgnedClientNummerResponse(
  zorgnedResponseData: ZorgnedPersoonsgegevensNAWResponse
) {
  if (zorgnedResponseData?.persoon?.clientidentificatie) {
    return transformToAdministratienummer(
      zorgnedResponseData.persoon.clientidentificatie
    );
  }
  return null;
}

export async function fetchAdministratienummer(bsn: BSN) {
  const response = await fetchPersoonsgegevensNAW(
    bsn,
    ZORGNED_AV_API_CONFIG_KEY
  );

  let administratienummer: string | null = null;

  if (response.status === 'OK') {
    if (response.content) {
      administratienummer = transformZorgnedClientNummerResponse(
        response.content
      );
    }
    return apiSuccessResult(administratienummer);
  }

  return response;
}

function isActueel(aanvraagTransformed: ZorgnedAanvraagTransformed) {
  const isEOG = aanvraagTransformed.datumEindeGeldigheid
    ? isDateInPast(aanvraagTransformed.datumEindeGeldigheid, new Date())
    : false;

  const isActueel = aanvraagTransformed.isActueel;

  switch (true) {
    case aanvraagTransformed.resultaat === 'afgewezen':
      return false;
    // We can't show the datumIngangGeldigheid of the right to this regeling, move it to non-actual.
    case !aanvraagTransformed.datumIngangGeldigheid:
      return false;
    // Override actueel indien de einde geldigheid is verlopen
    case isActueel && (isEOG || aanvraagTransformed.resultaat === 'afgewezen'):
      return false;
    case !isActueel && !isEOG:
      return true;
  }

  return isActueel;
}

function transformTitle(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  if (aanvraag.productIdentificatie === AV_CZM) {
    return 'Collectieve zorgverzekering';
  }
  return aanvraag.titel;
}

export async function fetchZorgnedAanvragenHLI(bsn: BSN) {
  const aanvragenResponse = await fetchAanvragenWithRelatedPersons(bsn, {
    zorgnedApiConfigKey: ZORGNED_AV_API_CONFIG_KEY,
  });

  if (aanvragenResponse.status === 'OK') {
    const aanvragenTransformed: ZorgnedAanvraagWithRelatedPersonsTransformed[] =
      aanvragenResponse.content.map((aanvraagTransformed) => {
        // Override isActueel for front-end.
        return {
          ...aanvraagTransformed,
          titel: transformTitle(aanvraagTransformed),
          isActueel: isActueel(aanvraagTransformed),
          documenten: aanvraagTransformed.documenten,
        };
      });

    return apiSuccessResult(aanvragenTransformed);
  }

  return aanvragenResponse;
}

export const forTesting = {
  isActueel,
  transformToAdministratienummer,
  transformZorgnedClientNummerResponse,
};
