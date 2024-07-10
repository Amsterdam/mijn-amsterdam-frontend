import { ZorgnedStatusLineItemsConfig } from '../zorgned/zorgned-config-and-types';
import { PCVERGOEDING } from './status-line-items/pcvergoeding';
import { REGELING } from './status-line-items/regeling';
import { REGELING_PERIODIEK } from './status-line-items/regeling-periodiek';

export const hliStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    leveringsVorm: '',
    productsoortCodes: ['AV-ALG'],
    productIdentificatie: [
      'AV-UPC',
      'AV-PCV',
      'AV-PCVC',
      'AV-PCVZIL',
      'AV-UPCZIL',
    ],
    lineItemTransformers: PCVERGOEDING,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AV-ALG'],
    productIdentificatie: ['AV-GOV', 'AV-OVM'],
    lineItemTransformers: REGELING,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AV-ALG'],
    productIdentificatie: ['AV-CZM', 'AV-IIT', 'AV-KVS', 'AV-SPM', 'AV-TAOV'],
    lineItemTransformers: REGELING_PERIODIEK,
  },
];
