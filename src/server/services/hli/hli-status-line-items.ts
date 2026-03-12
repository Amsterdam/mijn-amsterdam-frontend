import type { ZorgnedHLIRegeling } from './hli-regelingen-types.ts';
import type {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemsConfig,
} from '../zorgned/zorgned-types.ts';
import { DECLARATIE } from './status-line-items/declaratie.ts';
import { AV_CZM, REGELING_CZM } from './status-line-items/regeling-czm.ts';
import {
  verzilveringCodes,
  AV_PCVC,
  AV_UPCC,
  PCVERGOEDING,
  PCVERGOEDING_2026,
  MAMS_PC2026,
} from './status-line-items/regeling-pcvergoeding.ts';
import { REGELING_PERIODIEK } from './status-line-items/regeling-periodiek.ts';
import { REGELING } from './status-line-items/regeling.ts';
import { themaConfig } from '../../../client/pages/Thema/HLI/HLI-thema-config.ts';

export const hliStatusLineItemsConfig: ZorgnedStatusLineItemsConfig<
  ZorgnedHLIRegeling | ZorgnedAanvraagWithRelatedPersonsTransformed
>[] = [
  {
    productIdentificatie: [AV_UPCC, AV_PCVC, ...verzilveringCodes],
    statusLineItems: { name: 'PCVERGOEDING', transformers: PCVERGOEDING },
  },
  {
    productIdentificatie: [MAMS_PC2026],
    statusLineItems: {
      name: 'PCVERGOEDING2026',
      transformers: PCVERGOEDING_2026,
    },
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
    isDisabled: !themaConfig.featureToggle.regelingen.enabledCZM,
  },
];
