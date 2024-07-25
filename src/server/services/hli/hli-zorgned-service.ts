import { AuthProfileAndToken } from '../../helpers/app';
import {
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
  ZorgnedPersoonsgegevensNAWResponse,
} from '../zorgned/zorgned-config-and-types';
import {
  fetchAanvragen,
  fetchPersoonsgegevensNAW,
} from '../zorgned/zorgned-service';

import memoizee from 'memoizee';
import {
  apiErrorResult,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import { getFullName } from '../../../universal/helpers/brp';
import { isDateInPast } from '../../../universal/helpers/date';
import { ONE_SECOND_MS } from '../../config';

function isEindeGeldigheidVerstreken(aanvraag: ZorgnedAanvraagTransformed) {
  return (
    !!aanvraag.datumEindeGeldigheid &&
    isDateInPast(aanvraag.datumEindeGeldigheid)
  );
}

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
    return (
      zorgnedResponseData?.persoon?.voornamen ??
      getFullName({
        voornamen: zorgnedResponseData?.persoon?.voornamen,
        geslachtsnaam: zorgnedResponseData?.persoon?.geboortenaam,
        voorvoegselGeslachtsnaam: zorgnedResponseData?.persoon?.voorvoegsel,
      })
    );
  }
  return null;
}

export async function fetchNamenBetrokkenen_(
  requestID: requestID,
  userIDs: string[]
) {
  const requests = userIDs.map((userID) => {
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

function isActueel(aanvraagTransformed: ZorgnedAanvraagTransformed) {
  const isEOG = isEindeGeldigheidVerstreken(aanvraagTransformed);
  const isActueel = aanvraagTransformed.isActueel;

  switch (true) {
    case aanvraagTransformed.resultaat === 'afgewezen':
      return false;
    case !aanvraagTransformed.datumIngangGeldigheid:
      return false;
    // Override actueel indien de einde geldigheid is verlopen
    case isActueel && (isEOG || aanvraagTransformed.resultaat === 'afgewezen'):
      return false;
    case !isActueel && !isEOG:
      return true;
  }

  return false;
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

export const forTesting = {
  isActueel,
  transformZorgnedBetrokkeneNaamResponse,
  transformToAdministratienummer,
  transformZorgnedClientNummerResponse,
};
