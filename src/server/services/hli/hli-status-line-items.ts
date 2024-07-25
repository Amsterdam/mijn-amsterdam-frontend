import { ZorgnedStatusLineItemsConfig } from '../zorgned/zorgned-config-and-types';
import { DECLARATIE } from './status-line-items/declaratie';
import {
  AV_PCVC,
  AV_PCVZIL,
  AV_UPCC,
  AV_UPCZIL,
  shouldIncludePcvcUpcc,
  PCVERGOEDING,
} from './status-line-items/pcvergoeding';
import { REGELING } from './status-line-items/regeling';
import { REGELING_PERIODIEK } from './status-line-items/regeling-periodiek';

export const hliStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    productIdentificatie: [AV_UPCC, AV_UPCZIL, AV_PCVC, AV_PCVZIL],
    lineItemTransformers: PCVERGOEDING,
    filter: shouldIncludePcvcUpcc,
  },
  {
    productIdentificatie: ['AV-GOV', 'AV-OVM'],
    lineItemTransformers: REGELING,
  },
  {
    productIdentificatie: ['AV-DECLA'],
    lineItemTransformers: DECLARATIE,
  },
  {
    productIdentificatie: ['AV-CZM', 'AV-IIT', 'AV-KVS', 'AV-SPM', 'AV-TAOV'],
    lineItemTransformers: REGELING_PERIODIEK,
  },
];
