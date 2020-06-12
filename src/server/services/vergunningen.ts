import { ApiUrls, getApiConfigValue } from '../config';
import { requestData } from '../helpers';

export interface VergunningSource {
  status: string;
  title: string;
  identifier: string;
  caseType: string;
  dateRequest: string;
  dateFrom: string;
  dateEnd: string;
  timeStart: string;
  timeEnd: string;
  isActual: boolean;
  kenteken?: string;
  location?: string;
}

export type VergunningenSourceData = VergunningSource[];

export interface Vergunning extends VergunningSource {}

export type VergunningenData = Vergunning[];

export function transformVergunningenData(
  responseData: VergunningenSourceData
): VergunningenData {
  return responseData;
}

export function fetchVergunningen(sessionID: SessionID, samlToken: string) {
  return requestData<VergunningenData>(
    {
      url: ApiUrls.VERGUNNINGEN,
      transformResponse: transformVergunningenData,
    },
    sessionID,
    samlToken,
    getApiConfigValue('VERGUNNINGEN', 'postponeFetch', false)
  );
}
