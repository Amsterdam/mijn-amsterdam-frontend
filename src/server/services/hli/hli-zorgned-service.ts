import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { ZORGNED_GEMEENTE_CODE } from '../zorgned/zorgned-config-and-types';
import { fetchAanvragen } from '../zorgned/zorgned-service';

import {
  HLIRegeling,
  RegelingenSourceResponseData,
  ZorgnedPersoonsgegevensNAWResponse,
} from './regelingen-types';

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
  const dataRequestConfig = getApiConfig('ZORGNED_AV');
  const url = `${dataRequestConfig.url}/persoonsgegevensNAW`;
  const postData = {
    burgerservicenummer: authProfileAndToken.profile.id,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
  };
  const clientNummerResponse = requestData<string>(
    {
      ...dataRequestConfig,
      data: postData,
      transformResponse: transformZorgnedClientNummerResponse,
      url,
    },
    requestID,
    authProfileAndToken
  );

  return clientNummerResponse;
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

  // TODO: Filter response

  return aanvragenResponse;
}
