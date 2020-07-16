import { requestData } from '../helpers';
import { getApiConfig } from '../config';

export interface KVKSourceDataContent {
  name: string;
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
  kvkNummer: string,
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<KVKData>(
    getApiConfig(SERVICE_NAME, {
      transformResponse: transformKVKData,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
