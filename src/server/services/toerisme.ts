import { requestData } from '../helpers';
import { getApiConfig } from '../config';

export interface ToerismeDataContent {
  city: String;
  houseLetter: String | null;
  houseNumber: String | null;
  houseNumberExtension: String | null;
  postalCode: String | null;
  registrationNumber: String | null;
  shortName: String | null;
  street: String | null;
}

export interface ToerismeSourceData {
  content: ToerismeDataContent[];
}

export interface ToerismeData extends ToerismeDataContent {}

export function transformToerismeData(
  responseData: ToerismeSourceData
): ToerismeData[] | null {
  return responseData.content;
}

export function fetchToerisme(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<ToerismeData[]>(
    getApiConfig('TOERISME', {
      transformResponse: transformToerismeData,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
