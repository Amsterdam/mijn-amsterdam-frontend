import type { ZorgnedHLIRegeling } from './hli-regelingen-types';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemsConfig,
} from '../zorgned/zorgned-types';
import { DECLARATIE } from './status-line-items/declaratie';
import { REGELING } from './status-line-items/regeling';
import { AV_CZM, REGELING_CZM } from './status-line-items/regeling-czm';
import {
  verzilveringCodes,
  AV_PCVC,
  AV_UPCC,
  PCVERGOEDING,
} from './status-line-items/regeling-pcvergoeding';
import { REGELING_PERIODIEK } from './status-line-items/regeling-periodiek';
import { featureToggle } from '../../../client/pages/Thema/HLI/HLI-thema-config';

export const hliStatusLineItemsConfig: ZorgnedStatusLineItemsConfig<
  ZorgnedHLIRegeling | ZorgnedAanvraagWithRelatedPersonsTransformed
>[] = [
  {
    productIdentificatie: [AV_UPCC, AV_PCVC, ...verzilveringCodes],
    statusLineItems: { name: 'PCVERGOEDING', transformers: PCVERGOEDING },
  },
  {
    productIdentificatie: ['AV-GOV', 'AV-OVM', 'AV-RTM'],
    statusLineItems: { name: 'REGELING', transformers: REGELING },
  },
  {
    productIdentificatie: ['AV-DECLA'],
    statusLineItems: { name: 'DECLARATIE', transformers: DECLARATIE },
  },
  {
    productIdentificatie: ['AV-IIT', 'AV-KVS', 'AV-SPM', 'AV-TAOV', 'AV-RKV'],
    statusLineItems: {
      name: 'REGELING_PERIODIEK',
      transformers: REGELING_PERIODIEK,
    },
  },
  {
    productIdentificatie: [AV_CZM],
    statusLineItems: { name: 'REGELING_CZM', transformers: REGELING_CZM },
    isDisabled: !featureToggle.hliRegelingEnabledCZM,
  },
];
