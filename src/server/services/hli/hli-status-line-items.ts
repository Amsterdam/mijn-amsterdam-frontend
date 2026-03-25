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
    productgroep: 'PCVERGOEDING',
    productIdentificatie: [AV_UPCC, AV_PCVC, ...verzilveringCodes],
    statusLineItems: { transformers: PCVERGOEDING },
  },
  {
    productgroep: 'PCVERGOEDING2026',
    productIdentificatie: [MAMS_PC2026],
    statusLineItems: {
      transformers: PCVERGOEDING_2026,
    },
  },
  {
    productgroep: 'REGELING',
    productIdentificatie: ['AV-GOV', 'AV-OVM', 'AV-RTM'],
    statusLineItems: { transformers: REGELING },
  },
  {
    productgroep: 'DECLARATIE',
    productIdentificatie: ['AV-DECLA'],
    statusLineItems: { transformers: DECLARATIE },
  },
  {
    productgroep: 'REGELING_PERIODIEK',
    productIdentificatie: ['AV-IIT', 'AV-KVS', 'AV-SPM', 'AV-TAOV', 'AV-RKV'],
    statusLineItems: {
      transformers: REGELING_PERIODIEK,
    },
  },
  {
    productgroep: 'REGELING_CZM',
    productIdentificatie: [AV_CZM],
    statusLineItems: { transformers: REGELING_CZM },
    isDisabled: !themaConfig.featureToggle.regelingen.enabledCZM,
  },
];
