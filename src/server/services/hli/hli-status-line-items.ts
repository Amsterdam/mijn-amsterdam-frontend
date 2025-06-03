import type { ZorgnedHLIRegeling } from './hli-regelingen-types';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemsConfig,
} from '../zorgned/zorgned-types';
import { DECLARATIE } from './status-line-items/declaratie';
import { REGELING } from './status-line-items/regeling';
import { AV_CZM, REGELING_CZM } from './status-line-items/regeling-czm';
import {
  AV_PCVC,
  AV_PCVTG,
  AV_PCVZIL,
  AV_UPCC,
  AV_UPCTG,
  AV_UPCZIL,
  PCVERGOEDING,
} from './status-line-items/regeling-pcvergoeding';
import { REGELING_PERIODIEK } from './status-line-items/regeling-periodiek';
import {
  AV_RTM_DEEL1,
  AV_RTM_DEEL2,
  RTM,
} from './status-line-items/regeling-rtm';
import { featureToggle } from '../../../client/pages/Thema/HLI/HLI-thema-config';

export const hliStatusLineItemsConfig: ZorgnedStatusLineItemsConfig<
  ZorgnedHLIRegeling | ZorgnedAanvraagWithRelatedPersonsTransformed
>[] = [
  {
    productIdentificatie: [
      AV_UPCC,
      AV_UPCZIL,
      AV_PCVC,
      AV_PCVZIL,
      AV_PCVTG,
      AV_UPCTG,
    ],
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
