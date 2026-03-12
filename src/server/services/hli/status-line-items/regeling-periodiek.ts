import { BESLUIT, EINDE_RECHT } from './generic.ts';
import type {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types.ts';

export const REGELING_PERIODIEK: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed>[] =
  [BESLUIT, EINDE_RECHT];
