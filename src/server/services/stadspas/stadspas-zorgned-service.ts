import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { ZORGNED_GEMEENTE_CODE } from '../wmo/config';

function volledigClientnummer(identificatie: number): string {
  const clientnummerPadded = String(identificatie).padStart(10, '0');
  const clientnummer = `${ZORGNED_GEMEENTE_CODE}${clientnummerPadded}`;
  return clientnummer;
}

interface ZorgnedPersoonsgegevensNAWResponse {
  persoon: {
    clientidentificatie: number | null;
  };
}

function transformZorgnedClientNummerResponse(
  zorgnedResponseData: ZorgnedPersoonsgegevensNAWResponse
) {
  if (zorgnedResponseData?.persoon?.clientidentificatie !== null) {
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
  const dataRequestConfig = getApiConfig('ZORGNED');
  const url = `${dataRequestConfig.url}/persoonsgegevensNAW`;
  const postData = {
    burgerservicenummer: authProfileAndToken.profile.id,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
  };
  const clientNummerResponse = requestData<string | null>(
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
