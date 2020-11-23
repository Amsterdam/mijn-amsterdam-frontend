import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { FocusTozoStepType, FocusTozoLabelSet } from './focus-tozo-content';
import { GenericDocument } from '../../../universal/types/App.types';

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
  documentCodeId: string;
  productTitle: string;
  stepType: FocusTozoStepType;
  productSpecific?: FocusTozoLabelSet['productSpecific'];
}

export interface FocusStadspasBudget {
  balance: number;
  assigned: number;
  title: string;
  description: string;
  code: string;
  urlTransactions: string;
}

export interface FocusStadspas {
  id: number;
  pasnummer: number;
  naam: string;
  datumAfloop: string;
  budgets: FocusStadspasBudget[];
}

export interface FocusStadspasSaldo {
  type: 'hoofpashouder' | 'partner' | 'kind';
  stadspassen: FocusStadspas[];
}

export type FocusInkomenSpecificatieCategory =
  | 'IOAZ'
  | 'BBS'
  | 'WKO'
  | 'IOAW'
  | 'STIMREG'
  | 'BIBI'
  | 'PART'
  | 'BBZ'
  | string;

export interface FocusInkomenSpecificatie extends GenericDocument {
  title: string;
  datePublished: string;
  id: string;
  url: string;
  category: FocusInkomenSpecificatieCategory;
}

export interface FocusCombinedSourceResponse {
  uitkeringsspecificaties: FocusInkomenSpecificatie[];
  jaaropgaven: FocusInkomenSpecificatie[];
  tozodocumenten: FocusTozoDocument[];
  stadspassaldo: FocusStadspasSaldo;
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
