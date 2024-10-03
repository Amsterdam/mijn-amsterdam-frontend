import memoizee from 'memoizee';

import { HTTP_STATUS_CODES } from '../../../universal/constants/errorCodes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { isDateInPast } from '../../../universal/helpers/date';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_SECOND_MS } from '../../config/app';
import {
  fetchAanvragenWithRelatedPersons,
  fetchPersoonsgegevensNAW,
} from '../zorgned/zorgned-service';
import {
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedPersoonsgegevensNAWResponse,
} from '../zorgned/zorgned-types';

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

export async function fetchAdministratienummer(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchPersoonsgegevensNAW(
    requestID,
    authProfileAndToken.profile.id,
    'ZORGNED_AV'
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

  if (
    response.status === 'ERROR' &&
    response.code === HTTP_STATUS_CODES.NOT_FOUND
  ) {
    // 404 means there is no record available in the ZORGNED api for the requested BSN
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

async function fetchZorgnedAanvragenHLI_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const aanvragenResponse = await fetchAanvragenWithRelatedPersons(
    requestID,
    authProfileAndToken,
    { zorgnedApiConfigKey: 'ZORGNED_AV' }
  );

  if (aanvragenResponse.status === 'OK') {
    const aanvragenTransformed: ZorgnedAanvraagWithRelatedPersonsTransformed[] =
      aanvragenResponse.content.map((aanvraagTransformed) => {
        // Override isActueel for front-end.
        return {
          ...aanvraagTransformed,
          isActueel: isActueel(aanvraagTransformed),
        };
      });

    return apiSuccessResult(aanvragenTransformed);
  }

  return aanvragenResponse;
}

const maxAgeSeconds = 45;
export const fetchZorgnedAanvragenHLI = memoizee(fetchZorgnedAanvragenHLI_, {
  maxAge: maxAgeSeconds * ONE_SECOND_MS,
});

export const forTesting = {
  isActueel,
  transformToAdministratienummer,
  transformZorgnedClientNummerResponse,
};
