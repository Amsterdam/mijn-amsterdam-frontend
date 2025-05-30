import { BAGQueryParams, type BAGData, type BAGSourceData } from './bag.types';
import {
  apiErrorResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import { getLatLngCoordinates } from '../../../universal/helpers/bag';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import type { Adres } from '../profile/brp.types';

function transformBagResponse(
  sourceAddress: Adres,
  responseData: BAGSourceData
): BAGData | null {
  const data = responseData._embedded?.adresseerbareobjecten;
  if (!data?.length) {
    return null;
  }

  // Multiple items can be found, but only the first we take as relevant.
  const firstItem = data[0];

  const latlng = getLatLngCoordinates(
    firstItem.adresseerbaarObjectPuntGeometrieWgs84.coordinates
  );

  return {
    latlng,
    address: sourceAddress,
    bagAddress: firstItem,
    bagNummeraanduidingId: firstItem.identificatie,
  };
}

export async function fetchBAG(
  sourceAddress: Adres | null
): Promise<ApiResponse<BAGData>> {
  if (!sourceAddress?.straatnaam || !sourceAddress.huisnummer) {
    return apiErrorResult('Could not query BAG, no address supplied.', null);
  }

  const params: BAGQueryParams = {
    openbareruimteNaam: sourceAddress.straatnaam,
    huisnummer: sourceAddress.huisnummer,
    huisletter: sourceAddress.huisletter || undefined,
  };

  const config = getApiConfig('BAG', {
    params,
    transformResponse(responseData: BAGSourceData): BAGData | null {
      return transformBagResponse(sourceAddress, responseData);
    },
  });
  return requestData<BAGData>(config);
}
