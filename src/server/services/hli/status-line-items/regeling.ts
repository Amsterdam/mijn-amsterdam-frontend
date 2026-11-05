import type {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types.ts';
import { BESLUIT, EINDE_RECHT } from './generic.ts';

export const REGELING: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed>[] =
  [BESLUIT, EINDE_RECHT];
