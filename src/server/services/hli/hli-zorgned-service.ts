import { AuthProfileAndToken } from '../../helpers/app';
import {
  fetchAanvragen,
  fetchPersoonsgegevensNAW,
} from '../zorgned/zorgned-service';
import {
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
  ZorgnedPersoonsgegevensNAWResponse,
} from '../zorgned/zorgned-types';

import { apiSuccessResult } from '../../../universal/helpers/api';
import { isBeforeToday } from '../wmo/status-line-items/wmo-generic';
import memoizee from 'memoizee';
import { ONE_SECOND_MS } from '../../config';

function transformToAdministratienummer(identificatie: number): string {
  const clientnummerPadded = String(identificatie).padStart(10, '0');
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
  requestID: requestID,
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

  if (response.status === 'ERROR' && response.code === 404) {
    // 404 means there is no record available in the ZORGNED api for the requested BSN
    return apiSuccessResult(administratienummer);
  }

  return response;
}

function isActueel(aanvraagTransformed: ZorgnedAanvraagTransformed) {
  const isEOG = isBeforeToday(
    aanvraagTransformed.datumEindeGeldigheid,
    new Date()
  );
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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const aanvragenResponse = await fetchAanvragen(
    requestID,
    authProfileAndToken,
    { zorgnedApiConfigKey: 'ZORGNED_AV', includeBetrokkenen: true }
  );

  if (aanvragenResponse.status === 'OK') {
    const aanvragenTransformed = aanvragenResponse.content.map(
      (aanvraagTransformed) => {
        // Override isActueel for front-end.
        return {
          ...aanvraagTransformed,
          isActueel: isActueel(aanvraagTransformed),
        };
      }
    );
    return apiSuccessResult(aanvragenTransformed);
  }

  return aanvragenResponse;
}

export const fetchZorgnedAanvragenHLI = memoizee(fetchZorgnedAanvragenHLI_, {
  maxAge: 45 * ONE_SECOND_MS,
});

export const forTesting = {
  isActueel,
  transformToAdministratienummer,
  transformZorgnedClientNummerResponse,
};
