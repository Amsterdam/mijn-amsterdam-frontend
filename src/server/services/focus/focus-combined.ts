import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';

export type FocusTozoDocumentType =
  | 'E-AANVR-KBBZ'
  | 'E-AANVR-TOZO'
  | 'E-AANVR-TOZ2';

export interface FocusTozoDocument {
  datePublished: string;
  id: string;
  description: string;
  url: string;
  type: FocusTozoDocumentType;
  productTitle: string;
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
  samlToken: string,
  raw: boolean = false
) {
  return requestData<FocusCombinedSourceResponse>(
    getApiConfig('FOCUS_COMBINED', {
      transformResponse: (response: { content: FocusCombinedSourceResponse }) =>
        raw ? response : response.content,
    }),
    sessionID,
    samlToken
  );
}
