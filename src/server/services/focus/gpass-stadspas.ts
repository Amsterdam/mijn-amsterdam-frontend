import { requestData } from '../../helpers';
import { getApiConfig } from '../../config';

export interface GPassStadspasBudget {
  balance: number;
  assigned: number;
  title: string;
}

// The items you get from the api source
export interface GPassStadspasSource {
  id: string;
  pasnummer: string;
  naam: string;
  datumAfloop: string;
  budgets: GPassStadspasBudget[];
}

export interface GPassStadspasTransaction {
  id: string;
  title: string;
  amount: string;
  date: string;
}

// The root type of the api source
export interface GPassStadspasSourceData {
  content: GPassStadspasSource[];
}

// The items you want to output in this api
export interface GPassStadspas extends GPassStadspasSource {}

// The root type of the items you want to output in this api
export type GPassStadspasData = GPassStadspas[];

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
