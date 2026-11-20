import type { LatLngLiteral } from 'leaflet';

import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { fetchMyLocations } from '../bag/my-locations.ts';
import type { EnergieLabelSourceData, EnergieLabelTransformed } from './energie.types.ts';

export async function fetchEnergie(authProfileAndToken: AuthProfileAndToken) {
  const MY_LOCATION = await fetchMyLocations(authProfileAndToken);

  if (MY_LOCATION.status === 'OK') {
    const primaryLocation = MY_LOCATION.content?.[0];
    const bagID = primaryLocation?.bagNummeraanduidingId ?? null;

    if (!bagID) {
      return apiSuccessResult([]);
    }

    return fetchEnergieLabel(bagID);
  }

  return apiDependencyError({ MY_LOCATION });
}

export async function fetchEnergieLabel(
  bagID: string,
) {
  const params = {
    bagNummeraanduidingId: bagID,
  };
  const energieLabelData = await requestData<
    EnergieLabelTransformed[]
  >(
    getApiConfig('ENERGIE', {
      params,
      transformResponse: (energieLabelSourceData: EnergieLabelSourceData) =>
        transformEnergieLabelDataResponse(energieLabelSourceData),
    })
  );

  return energieLabelData;
}

export function transformEnergieLabelDataResponse(
  energieLabelSourceData: EnergieLabelSourceData,
): EnergieLabelTransformed[] {

  const energieLabelFractions = energieLabelSourceData._embedded?.energielabel ?? [];

  return energieLabelFractions.map((fractionData) => ({
    energieklasse: fractionData.energieklasse,
    metingGeldigTot: fractionData.metingGeldigTot,
  }));
}

