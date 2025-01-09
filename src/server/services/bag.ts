import { LatLngLiteral } from 'leaflet';

import { apiErrorResult, ApiResponse } from '../../universal/helpers/api';
import { getLatLngCoordinates } from '../../universal/helpers/bag';
import { Adres } from '../../universal/types';
import { BAGQueryParams } from '../../universal/types/bag';
import { getApiConfig } from '../helpers/source-api-helpers';
import { requestData } from '../helpers/source-api-request';

export interface BAGData {
  latlng: LatLngLiteral | null;
  address?: Adres | null;
  bagNummeraanduidingId?: string | null;
  profileType: ProfileType;
}

export async function fetchBAG(
  requestID: RequestID,
  sourceAddress: Adres | null
): Promise<ApiResponse<BAGData | null>> {
  if (!sourceAddress?.straatnaam || !sourceAddress.huisnummer) {
    return apiErrorResult('Could not query BAG, no address supplied.', null);
  }

  const params: BAGQueryParams<string> = {
    openbareruimteNaam: sourceAddress.straatnaam,
    huisnummer: sourceAddress.huisnummer,
    huisletter: sourceAddress.huisletter || undefined,
  };

  const config = getApiConfig('BAG', {
    params,
    cacheKey: `${requestID}-${sourceAddress.straatnaam}-${sourceAddress.huisnummer}${sourceAddress.huisletter}`,
    transformResponse: (responseData) => {
      const data = responseData._embedded?.adresseerbareobjecten;
      if (!data || data.length < 1) {
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
        bagNummeraanduidingId: firstItem.identificatie,
      };
    },
  });
  return requestData<BAGData>(config, requestID);
}
