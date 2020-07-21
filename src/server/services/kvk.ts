import { requestData } from '../helpers';
import { getApiConfig } from '../config';

export interface AddresCommercial {
  straatnaam: string | null;
  postcode: string | null;
  woonplaatsNaam: string | null;
  huisnummer: string | null;
  huisnummertoevoeging: string | null;
  huisletter: string | null;
  begindatumVerblijf: string | null;
  inOnderzoek: boolean;
}

export interface KVKSourceDataContent {
  name: string;
  address: AddresCommercial;
  mokum: boolean;
}
export interface KVKSourceData {
  content: KVKSourceDataContent;
}

export interface KVKData extends KVKSourceDataContent {}

export function transformKVKData(responseData: KVKSourceData): KVKData {
  return responseData.content;
}

const SERVICE_NAME = 'KVK'; // Change to your service name

export function fetchKVK(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  kvkNummer?: string
) {
  return requestData<KVKData>(
    getApiConfig(SERVICE_NAME, {
      transformResponse: transformKVKData,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
