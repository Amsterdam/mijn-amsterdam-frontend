import { AuthProfileAndToken } from '../../helpers/app';
import {
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
} from '../zorgned/zorgned-config-and-types';
import {
  fetchAanvragen,
  fetchPersoonsgegevensNAW,
} from '../zorgned/zorgned-service';

import {
  apiErrorResult,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import { getFullName } from '../../../universal/helpers/brp';
import { jsonCopy } from '../../../universal/helpers/utils';
import { ZorgnedPersoonsgegevensNAWResponse } from './regelingen-types';
import { isEindeGeldigheidVerstreken } from './status-line-items/pcvergoeding';
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

function transformZorgnedBetrokkeneNaamResponse(
  zorgnedResponseData: ZorgnedPersoonsgegevensNAWResponse
) {
  if (zorgnedResponseData?.persoon) {
    return getFullName({
      voornamen: zorgnedResponseData?.persoon?.voornamen,
      geslachtsnaam: zorgnedResponseData?.persoon?.geboortenaam,
      voorvoegselGeslachtsnaam: zorgnedResponseData?.persoon?.voorvoegsel,
    });
  }
  return null;
}

export async function fetchNamenBetrokkenen_(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  userIDs: string[]
) {
  const requests = userIDs.map((userID) => {
    authProfileAndToken.token = ''; // Token is bound to another ID, we don't need it and don't want to mistakenly use it anyway.
    return fetchPersoonsgegevensNAW(requestID, userID, 'ZORGNED_AV');
  });

  const results = await Promise.allSettled(requests);
  const namen: string[] = [];

  for (const result of results) {
    const response = getSettledResult(result);
    const naam =
      response.status === 'OK'
        ? transformZorgnedBetrokkeneNaamResponse(response.content)
        : null;
    if (naam) {
      namen.push(naam);
    } else {
      return apiErrorResult(
        'Something went wrong when retrieving names of betrokkenen.',
        null
      );
    }
  }

  return apiSuccessResult(namen);
}

export const fetchNamenBetrokkenen = memoizee(fetchNamenBetrokkenen_, {
  length: 3,
  maxAge: 45 * ONE_SECOND_MS,
});

function assignIsActueel(aanvraagTransformed: ZorgnedAanvraagTransformed) {
  const isEOG = isEindeGeldigheidVerstreken(aanvraagTransformed);
  let isActueel = aanvraagTransformed.isActueel;

  // Override actueel indien de einde geldigheid is verlopen
  if (isActueel && isEOG) {
    isActueel = false;
  }
  if (!isActueel && !isEOG) {
    isActueel = true;
  }

  aanvraagTransformed.isActueel = isActueel;
}

export async function fetchZorgnedAanvragenHLI(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const aanvragenResponse = await fetchAanvragen(
    requestID,
    authProfileAndToken,
    'ZORGNED_AV'
  );

  if (aanvragenResponse.status === 'OK') {
    const aanvragenTransformed = aanvragenResponse.content.map(
      (aanvraagTransformed) => {
        // Override isActueel for front-end.
        assignIsActueel(aanvraagTransformed);
        return aanvraagTransformed;
      }
    );
    return apiSuccessResult(aanvragenTransformed);
  }

  return aanvragenResponse;
}

export const forTesting = {
  assignIsActueel,
  transformZorgnedBetrokkeneNaamResponse,
  transformToAdministratienummer,
  transformZorgnedClientNummerResponse,
};
