import { ZorgnedStatusLineItemsConfig } from '../zorgned/zorgned-config-and-types';
import { PCVERGOEDING } from './status-line-items/pcvergoeding';
import { REGELING } from './status-line-items/regeling';

export const hliStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    leveringsVorm: '',
    productsoortCodes: ['AV-ALG'],
    productIdentificatie: ['AV-UPC', 'AV-PCV', 'AV-PCVZIL', 'AV-UPCZIL'],
    lineItemTransformers: PCVERGOEDING,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AV-ALG'],
    productIdentificatie: [
      'AV-CZM',
      'AV-GOV',
      'AV-IIT',
      'AV-KVS',
      'AV-OVM',
      'AV-SPM',
      'AV-TAOV',
    ],
    lineItemTransformers: REGELING,
  },
];
