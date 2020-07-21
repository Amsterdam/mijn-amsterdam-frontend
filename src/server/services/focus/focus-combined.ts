import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { FocusTozoStepType } from './focus-tozo-content';

export type FocusTozoDocumentType =
  | 'E-AANVR-KBBZ'
  | 'E-AANVR-TOZO'
  | 'E-AANVR-TOZ2'
  | string;

export interface FocusTozoDocument {
  datePublished: string;
  id: string;
  description: string;
  url: string;
  type: FocusTozoDocumentType;
  productTitle: string;
  stepType: FocusTozoStepType;
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
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<FocusCombinedSourceResponse>(
    getApiConfig('FOCUS_COMBINED', {
      transformResponse: (response: { content: FocusCombinedSourceResponse }) =>
        response.content,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
