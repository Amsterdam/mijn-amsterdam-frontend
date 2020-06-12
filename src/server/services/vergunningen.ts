import { requestData } from '../helpers';
import { ApiUrls, getApiConfigValue } from '../config';
import { GenericDocument } from '../../universal/types/App.types';

export interface VergunningSource {
  title: string;
  documents: GenericDocument[];
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
