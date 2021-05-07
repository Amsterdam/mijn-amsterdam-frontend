import { requestData } from '../helpers';
import { getApiConfig } from '../config';

export interface ToeristischeVerhuurItem {
  city: string;
  houseLetter: string | null;
  houseNumber: string | null;
  houseNumberExtension: string | null;
  postalCode: string | null;
  registrationNumber: string | null;
  shortName: string | null;
  street: string | null;
}

export interface ToeristischeVerhuurSourceData {
  content: ToeristischeVerhuurItem[];
}

export function transformToeristischeVerhuur(
  responseData: ToeristischeVerhuurSourceData
): ToeristischeVerhuurItem[] | null {
  return responseData.content;
}

export function fetchToeristischeVerhuur(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<ToeristischeVerhuurItem[]>(
    getApiConfig('TOERISTISCHE_VERHUUR', {
      transformResponse: transformToeristischeVerhuur,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
