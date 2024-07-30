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

export const PGB: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  getTransformerConfigBesluit(isDecisionActive, false),
  EINDE_RECHT,
];
