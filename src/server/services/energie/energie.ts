import {
  apiDependencyError,
  apiErrorResult,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import type { BAGLocation } from '../bag/bag.types.ts';
import { fetchPrivate } from '../bag/my-locations.ts';
import type {
  EnergieLabelSourceData,
  EnergieLabelTransformed,
} from './energie.types.ts';

export async function fetchEnergie(authProfileAndToken: AuthProfileAndToken) {
  const bagResponse = await fetchPrivate(authProfileAndToken);

  if (bagResponse.status === 'ERROR') {
    return apiDependencyError({ bagResponse });
  }

  if (bagResponse.status === 'POSTPONE') {
    return bagResponse;
  }

  const bagLocations: BAGLocation[] = bagResponse.content ?? [];
  const verblijfsobjectIdentificatie =
    bagLocations?.[0]?.bagAddress?.verblijfsobjectIdentificatie;

  if (!verblijfsobjectIdentificatie) {
    return apiErrorResult(
      'No valid BAG verblijfsobjectIdentificatie found for the primary BAG location of the user',
      null
    );
  }
    return fetchEnergieLabel(verblijfsobjectIdentificatie);
}

export async function fetchEnergieLabel(bagVerblijfsobjectId: string) {
  const params = {
    bagVerblijfsobjectId,
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

export function transformEnergieLabelDataResponse(
  energieLabelSourceData: EnergieLabelSourceData
): EnergieLabelTransformed[] {
  const energieLabelFractions =
    energieLabelSourceData._embedded?.energielabel ?? [];

  return energieLabelFractions.map((fractionData) => ({
    energieklasse: fractionData.energieklasse,
    metingGeldigTot: fractionData.metingGeldigTot,
  }));
}
