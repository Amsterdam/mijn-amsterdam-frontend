import { requestData } from '../../helpers';
import { getApiConfig } from '../../config';

// The items you get from the api source
export interface GPassStadspasSource {
  id: string;
  pasnummer: string;
  naam: string;
  datumAfloop: string;

  saldo: number;
  totaal: number;
}

// The root type of the api source
export interface GPassStadspasSourceData {
  content: GPassStadspasSource[];
}

// The items you want to output in this api
export interface Service extends GPassStadspasSource {}

// The root type of the items you want to output in this api
export type GPassStadspasData = Service[];

// The function you can use to transform the api source data
export function transformGPassStadspasData(
  responseData: GPassStadspasSourceData
): GPassStadspasData {
  return responseData.content;
}

const SERVICE_NAME = 'STADSPAS'; // Change to your service name

export function fetchStadspas(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<GPassStadspasData>(
    getApiConfig(SERVICE_NAME, {
      transformResponse: transformGPassStadspasData,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
