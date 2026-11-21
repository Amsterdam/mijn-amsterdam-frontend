import { apiDependencyError } from '../../../universal/helpers/api.ts';
import { defaultDateFormat } from '../../../universal/helpers/date.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { fetchBrp } from '../brp/brp.ts';
import type { Adres } from '../brp/brp-types.ts';
import type {
  EnergieLabelSourceData,
  EnergieLabelTransformed,
} from './energie.types.ts';

export async function fetchEnergie(authProfileAndToken: AuthProfileAndToken) {
  const BrpResponse = await fetchBrp(authProfileAndToken);

  if (BrpResponse.status === 'ERROR') {
    return apiDependencyError({ BrpResponse });
  }

  if (BrpResponse.status === 'POSTPONE' || !BrpResponse.content.adres) {
    return BrpResponse;
  }

  return fetchEnergieLabel(BrpResponse.content.adres);
}

async function fetchEnergieLabel(adress: Adres) {
  const params = {
    postcode: adress.postcode,
    huisnummer: adress.huisnummer,
    ...(adress.huisnummertoevoeging !== null && {
      huisnummertoevoeging: adress.huisnummertoevoeging,
    }),
  };
  const energieLabelData = await requestData<EnergieLabelTransformed[]>(
    getApiConfig('ENERGIE', {
      params,
      transformResponse: (energieLabelSourceData: EnergieLabelSourceData) =>
        transformEnergieLabelDataResponse(energieLabelSourceData),
    })
  );

  return energieLabelData;
}

function transformEnergieLabelDataResponse(
  energieLabelSourceData: EnergieLabelSourceData
): EnergieLabelTransformed {
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
  fetchEnergieLabel,
  transformEnergieLabelDataResponse,
};
