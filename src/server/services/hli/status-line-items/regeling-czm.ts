import { BESLUIT, EINDE_RECHT } from './generic.ts';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types.ts';

export const AV_CZM = 'AV-CZM';

const EINDE_RECHT_CZM = {
  ...EINDE_RECHT,
  description() {
    return '<p>Als uw deelname aan de Collectieve zorgverzekering stopt, krijgt u hiervan tijdig bericht.</p>';
  },
};

export const REGELING_CZM: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed>[] =
  [BESLUIT, EINDE_RECHT_CZM];
