import type { ZorgnedHLIRegeling } from './hli-regelingen-types.ts';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemsConfig,
} from '../zorgned/zorgned-types.ts';
import { DECLARATIE } from './status-line-items/declaratie.ts';
import { REGELING } from './status-line-items/regeling.ts';
import { AV_CZM, REGELING_CZM } from './status-line-items/regeling-czm.ts';
import {
  verzilveringCodes,
  AV_PCVC,
  AV_UPCC,
  PCVERGOEDING,
} from './status-line-items/regeling-pcvergoeding.ts';
import { REGELING_PERIODIEK } from './status-line-items/regeling-periodiek.ts';
import {
  AV_RTM_DEEL1,
  AV_RTM_DEEL2,
  RTM,
} from './status-line-items/regeling-rtm.ts';
import { featureToggle } from '../../../client/pages/Thema/HLI/HLI-thema-config.ts';

export const hliStatusLineItemsConfig: ZorgnedStatusLineItemsConfig<
  ZorgnedHLIRegeling | ZorgnedAanvraagWithRelatedPersonsTransformed
>[] = [
  {
    productIdentificatie: [AV_UPCC, AV_PCVC, ...verzilveringCodes],
    lineItemTransformers: PCVERGOEDING,
  },
  {
    productIdentificatie: [AV_RTM_DEEL1, AV_RTM_DEEL2],
    lineItemTransformers: RTM,
    isDisabled: !featureToggle.hliRegelingEnabledRTM,
  },
  {
    productIdentificatie: ['AV-GOV', 'AV-OVM', 'AV-RTM'],
    lineItemTransformers: REGELING,
  },
  {
    productIdentificatie: ['AV-DECLA'],
    lineItemTransformers: DECLARATIE,
  },
  {
    productIdentificatie: ['AV-IIT', 'AV-KVS', 'AV-SPM', 'AV-TAOV'],
    lineItemTransformers: REGELING_PERIODIEK,
  },
  {
    productIdentificatie: [AV_CZM],
    lineItemTransformers: REGELING_CZM,
    isDisabled: !featureToggle.hliRegelingEnabledCZM,
  },
];
