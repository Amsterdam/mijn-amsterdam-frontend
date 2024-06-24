import { ZorgnedStatusLineItemsConfig } from '../zorgned/zorgned-config-and-types';
import { PCVERGOEDING } from './status-line-items/pcvergoeding';

export const hliStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: ['X'],
    lineItemTransformers: PCVERGOEDING,
  },
];
