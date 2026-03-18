import {
  AANVRAAG,
  getTransformerConfigBesluit,
  IN_BEHANDELING,
  MEER_INFORMATIE,
} from './wmo-generic.ts';
import type { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-types.ts';

export const WMO_AFWIJZING_ALL: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  getTransformerConfigBesluit(true, true),
];
