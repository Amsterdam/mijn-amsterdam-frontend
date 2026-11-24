import {
  type ApiResponse,
  apiDependencyError,
} from '../../../universal/helpers/api.ts';
import { defaultDateFormat } from '../../../universal/helpers/date.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { fetchBrp } from '../brp/brp.ts';
import type { Adres } from '../brp/brp-types.ts';
import type {
  EnergieLabelFrontend,
  EnergieLabelSourceData,
} from './energie-label.types.ts';
import { EnergieLabelRequestConfig } from './wonen-service-config.ts';

async function fetchEnergieLabel_<T>(
  dataRequestConfigSpecific: DataRequestConfig
) {
  const dataRequestConfigBase = getCustomApiConfig(
    EnergieLabelRequestConfig,
    dataRequestConfigSpecific
  );
  return requestData<T>(dataRequestConfigBase);
}

export async function fetchEnergieLabel(
  authProfileAndToken: AuthProfileAndToken
) {
  const BrpResponse = await fetchBrp(authProfileAndToken);

  if (BrpResponse.status !== 'OK') {
    return BrpResponse;
  }

  if (
    !BrpResponse.content.adres ||
    !BrpResponse.content.adres.postcode ||
    !BrpResponse.content.adres.huisnummer
  ) {
    const emptyResponse: ApiResponse<EnergieLabelFrontend> = {
      status: 'OK',
      content: {
        energieklasse: null,
        geldigTotDatum: null,
      },
    };

    return emptyResponse;
  }

  return fetchEnergieLabelForAddress(BrpResponse.content.adres);
}

async function fetchEnergieLabelForAddress(adress: Adres) {
  const params = {
    postcode: adress.postcode,
    huisnummer: adress.huisnummer,
    ...(adress.huisletter !== null && {
      huisletter: adress.huisletter,
    }),
    ...(adress.huisnummertoevoeging !== null && {
      huisnummertoevoeging: adress.huisnummertoevoeging,
    }),
  };

  const requestConfig: DataRequestConfig = {
    params,
    transformResponse: transformEnergieLabelDataResponse,
  };

  return fetchEnergieLabel_<EnergieLabelFrontend>(requestConfig);
}

function transformEnergieLabelDataResponse(
  energieLabelSourceData: EnergieLabelSourceData
): EnergieLabelFrontend {
  const energieLabelFractions =
    energieLabelSourceData._embedded?.energielabel ?? [];

  const firstFractionData = energieLabelFractions[0];
  return {
    energieklasse: firstFractionData?.energieklasse ?? null,
    geldigTotDatum: firstFractionData?.metingGeldigTot
      ? defaultDateFormat(firstFractionData.metingGeldigTot)
      : null,
  };
}

export const forTesting = {
  fetchEnergieLabelForAddress,
  transformEnergieLabelDataResponse,
};
