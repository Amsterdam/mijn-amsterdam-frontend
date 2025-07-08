import { apiSuccessResult } from '../../../universal/helpers/api';
import { isDateInPast } from '../../../universal/helpers/date';
import {
  fetchAanvragenWithRelatedPersons,
  fetchPersoonsgegevensNAW,
  fetchRelatedPersons,
} from '../zorgned/zorgned-service';
import {
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedPersoonsgegevensNAWResponse,
  type BSN,
  type ZorgnedPerson,
} from '../zorgned/zorgned-types';
import { AV_CZM } from './status-line-items/regeling-czm';
import { AV_UPC_PCV_CODES } from './status-line-items/regeling-pcvergoeding';

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
  const response = await fetchPersoonsgegevensNAW(bsn, 'ZORGNED_AV');

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

function transformBetrokkenPersonen(
  aanvrager: ZorgnedPerson,
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  if (
    aanvraag.productIdentificatie &&
    AV_UPC_PCV_CODES.includes(aanvraag.productIdentificatie)
  ) {
    // UPC/PCV aanvragen can only be requested for kids.
    return aanvraag.betrokkenPersonen.filter((persoon) => {
      return persoon.bsn !== aanvrager.bsn && !persoon.isPartner;
    });
  }

  return [];
}

export async function fetchZorgnedAanvragenHLI(bsn: BSN) {
  const aanvragenResponse = await fetchAanvragenWithRelatedPersons(bsn, {
    zorgnedApiConfigKey: 'ZORGNED_AV',
  });

  if (aanvragenResponse.status === 'OK') {
    const aanvragerResponse = await fetchRelatedPersons([bsn], 'ZORGNED_AV');
    const aanvragenTransformed: ZorgnedAanvraagWithRelatedPersonsTransformed[] =
      aanvragenResponse.content.map((aanvraagTransformed) => {
        // Override isActueel for front-end.
        return {
          ...aanvraagTransformed,
          titel: transformTitle(aanvraagTransformed),
          isActueel: isActueel(aanvraagTransformed),
          betrokkenPersonen: aanvragerResponse.content?.length
            ? transformBetrokkenPersonen(
                aanvragerResponse.content[0],
                aanvraagTransformed
              )
            : aanvraagTransformed.betrokkenPersonen,
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
