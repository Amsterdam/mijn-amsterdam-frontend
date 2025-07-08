import {
  AANVRAAG,
  EINDE_RECHT_PGB,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  isDecisionStatusActive,
  MEER_INFORMATIE,
} from './wmo-generic.ts';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-types.ts';

export const PGB: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  getTransformerConfigBesluit(isDecisionStatusActive, false),
  EINDE_RECHT_PGB,
];
