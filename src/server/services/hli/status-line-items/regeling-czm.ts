import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';
import { BESLUIT, EINDE_RECHT } from './generic';

const EINDE_RECHT_CZM = {
  ...EINDE_RECHT,
  description() {
    return '<p>Als uw deelname aan de Collectieve zorgverzekering stopt, krijgt u hiervan tijdig bericht.</p>';
  },
};

export const REGELING_CZM: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed>[] =
  [BESLUIT, EINDE_RECHT_CZM];
