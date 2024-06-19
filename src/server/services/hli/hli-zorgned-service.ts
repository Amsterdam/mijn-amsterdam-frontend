import { parseISO } from 'date-fns';
import {
  apiErrorResult,
  apiSuccessResult,
  getFullName,
  getSettledResult,
  isDateInPast,
  jsonCopy,
} from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
} from '../zorgned/zorgned-config-and-types';
import {
  fetchAanvragen,
  fetchPersoonsgegevensNAW,
} from '../zorgned/zorgned-service';

import { ZorgnedPersoonsgegevensNAWResponse } from './regelingen-types';

function volledigClientnummer(identificatie: number): string {
  const clientnummerPadded = String(identificatie).padStart(10, '0');
  const clientnummer = `${ZORGNED_GEMEENTE_CODE}${clientnummerPadded}`;
  return clientnummer;
}

function transformZorgnedClientNummerResponse(
  zorgnedResponseData: ZorgnedPersoonsgegevensNAWResponse
) {
  if (zorgnedResponseData?.persoon?.clientidentificatie) {
    return volledigClientnummer(
      zorgnedResponseData.persoon.clientidentificatie
    );
  }
  return null;
}

export async function fetchClientNummer(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchPersoonsgegevensNAW(
    requestID,
    authProfileAndToken,
    'ZORGNED_AV'
  );

  if (response.status === 'OK') {
    const clientNummer = transformZorgnedClientNummerResponse(response.content);
    if (clientNummer) {
      return apiSuccessResult(clientNummer);
    }
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

export async function fetchNamenBetrokkenen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  ids: string[]
) {
  const requests = ids.map((id) => {
    const authProfileAndTokenCopied = jsonCopy(authProfileAndToken);
    authProfileAndTokenCopied.profile.id = id;
    authProfileAndToken.token = ''; // Token is bound to another ID, we don't need it.
    return fetchPersoonsgegevensNAW(
      requestID,
      authProfileAndTokenCopied,
      'ZORGNED_AV'
    );
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

function assignIsActueel(aanvraagTransformed: ZorgnedAanvraagTransformed) {
  const isEOG =
    !!aanvraagTransformed.datumEindeGeldigheid &&
    isDateInPast(aanvraagTransformed.datumEindeGeldigheid); // is Einde Of Geldighed

  let isActueel = !!aanvraagTransformed.isActueel;

  // Override actueel indien er nog geen levering heeft plaatsgevonden en de geldigheid nog niet is afgelopen
  if (
    !isActueel &&
    !aanvraagTransformed.datumEindeLevering &&
    !aanvraagTransformed.datumBeginLevering &&
    !isEOG
  ) {
    isActueel = true;
  }

  // Override actueel indien de einde geldigheid is verlopen
  if (isActueel && isEOG) {
    isActueel = false;
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
