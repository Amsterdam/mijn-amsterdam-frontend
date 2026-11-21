import {
  type ApiResponse,
  apiDependencyError,
} from '../../../universal/helpers/api.ts';
import { defaultDateFormat } from '../../../universal/helpers/date.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { fetchBrp } from '../brp/brp.ts';
import type { Adres } from '../brp/brp-types.ts';
import type {
  EnergieLabelFrontend,
  EnergieLabelSourceData,
} from './energie-label.types.ts';

export async function fetchEnergieLabel(
  authProfileAndToken: AuthProfileAndToken
) {
  const BrpResponse = await fetchBrp(authProfileAndToken);

  if (BrpResponse.status === 'ERROR') {
    return apiDependencyError({ BrpResponse });
  }

  if (BrpResponse.status === 'POSTPONE') {
    return BrpResponse;
  }

  if (!BrpResponse.content.adres) {
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
  const energieLabelData = await requestData<EnergieLabelFrontend>(
    getApiConfig('ENERGIE_LABEL', {
      params,
      transformResponse: (energieLabelSourceData: EnergieLabelSourceData) =>
        transformEnergieLabelDataResponse(energieLabelSourceData),
    })
  );

  return energieLabelData;
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
