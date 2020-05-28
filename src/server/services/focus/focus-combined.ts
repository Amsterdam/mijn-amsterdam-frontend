import { ApiUrls, getApiConfigValue } from '../../config';
import { requestData } from '../../helpers';

export type FocusTozoDocumentType = 'E-AANVR-KBBZ' | 'E-AANVR-TOZO';

export interface FocusTozoDocument {
  datePublished: string;
  id: string;
  description: string;
  url: string;
  type: FocusTozoDocumentType;
}

export type FocusInkomenSpecificatieType =
  | 'IOAZ'
  | 'BBS'
  | 'WKO'
  | 'IOAW'
  | 'STIMREG'
  | 'BIBI'
  | 'PART'
  | 'BBZ'
  | string;

export interface FocusInkomenSpecificatie {
  title: string;
  datePublished: string;
  id: string;
  url: string;
  type: FocusInkomenSpecificatieType;
}

export interface FocusCombinedSourceResponse {
  uitkeringsspecificaties: FocusInkomenSpecificatie[];
  jaaropgaven: FocusInkomenSpecificatie[];
  tozodocumenten: FocusTozoDocument[];
}

export async function fetchFOCUSCombined(
  sessionID: SessionID,
  samlToken: string
) {
  return requestData<FocusCombinedSourceResponse>(
    {
      url: ApiUrls.FOCUS_COMBINED,
      transformResponse: ({ content = {} }) => content,
    },
    sessionID,
    samlToken,
    getApiConfigValue('FOCUS_COMBINED', 'postponeFetch', false)
  );
}
