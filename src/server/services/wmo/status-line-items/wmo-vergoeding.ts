import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';
import {
  AANVRAAG,
  EINDE_RECHT,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isDecisionActive,
  MEER_INFORMATIE,
} from './wmo-generic';

export const vergoeding: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  getTransformerConfigBesluit(isDecisionActive, true),
  EINDE_RECHT,
];
