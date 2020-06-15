import { ApiUrls, getApiConfigValue } from '../config';
import { requestData } from '../helpers';
import { LinkProps } from '../../universal/types/App.types';
import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../universal/config/routing';

export interface VergunningSource {
  id: string;
  status: string;
  title: string;
  identifier: string;
  caseType: string;
  dateRequest: string;
  dateValidStart: string;
  dateValidEnd: string;
  timeValidStart: string;
  timeValidEnd: string;
  isActual: boolean;
  kenteken?: string;
  location?: string;
}

export type VergunningenSourceData = VergunningSource[];

export interface Vergunning extends VergunningSource {
  link: LinkProps;
}

export type VergunningenData = Vergunning[];

export function transformVergunningenData(
  responseData: VergunningenSourceData
): VergunningenData {
  if (!Array.isArray(responseData)) {
    return [];
  }
  return responseData.map(item => {
    return Object.assign(item, {
      link: {
        to: generatePath(AppRoutes['VERGUNNINGEN/DETAIL'], {
          id: item.id,
        }),
        title: item.identifier,
      },
    });
  });
}

export function fetchVergunningen(
  sessionID: SessionID,
  samlToken: string,
  raw: boolean = false
) {
  return requestData<VergunningenData>(
    {
      url: ApiUrls.VERGUNNINGEN,
      transformResponse: responseData =>
        raw ? responseData : transformVergunningenData(responseData),
    },
    sessionID,
    samlToken,
    getApiConfigValue('VERGUNNINGEN', 'postponeFetch', false)
  );
}
