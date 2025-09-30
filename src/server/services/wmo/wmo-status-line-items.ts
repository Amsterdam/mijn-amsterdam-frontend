import {
  LeveringsVorm,
  ProductSoortCode,
  ZorgnedStatusLineItemsConfig,
} from '../zorgned/zorgned-types';
import { AOV } from './status-line-items/wmo-aov';
import { diensten } from './status-line-items/wmo-diensten';
import { hulpmiddelen } from './status-line-items/wmo-hulpmiddelen';
import { PGB } from './status-line-items/wmo-pgb';
import { vergoeding } from './status-line-items/wmo-vergoeding';
import { WRA } from './status-line-items/wmo-wra';

export const wmoStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: ['ZIN', 'WRA', 'WRA1', 'WRA2', 'WRA3', 'WRA4', 'WRA5'],
    statusLineItems: { name: 'WRA', transformers: WRA },
  },
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: [
      'AAN',
      'AUT',
      'FIE',
      'GBW',
      'OVE',
      'ROL',
      'RWD',
      'RWT',
      'SCO',
      'ORO',
      // TODO: Uncomment when the following productsoortCodes are available
      // 'ORW',
    ],
    statusLineItems: { name: 'hulpmiddelen', transformers: hulpmiddelen },
  },
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: [
      'AO1',
      'AO2',
      'AO3',
      'AO4',
      'AO5',
      'AO6',
      'AO7',
      'AO8',
      'BSW',
      'DBA',
      'DBH',
      'DBL',
      'DBS',
      'KVB',
      'MAO',
      'WMH',
      'AWBG',
      'LGO',
    ],
    statusLineItems: { name: 'diensten', transformers: diensten },
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['MAO'],
    statusLineItems: { name: 'diensten', transformers: diensten },
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AO2', 'AO5', 'DBS', 'KVB', 'WMH', 'AWBG'],
    statusLineItems: { name: 'diensten', transformers: diensten },
  },
  {
    leveringsVorm: 'PGB',
    productsoortCodes: [
      'AO2',
      'AO3',
      'AO4',
      'AO5',
      'BSW',
      'DBA',
      'DBH',
      'DBS',
      'KVB',
      'WMH',
      'AWBG',
    ],
    statusLineItems: { name: 'PGB', transformers: PGB },
  },
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: ['FIN', 'MVV', 'MVW', 'VHK', 'VVD', 'VVK'],
    statusLineItems: { name: 'vergoeding', transformers: vergoeding },
  },
  {
    leveringsVorm: 'PGB',
    productsoortCodes: [
      'AAN',
      'FIE',
      'FIN',
      'MVV',
      'MVW',
      'OVE',
      'PER',
      'ROL',
      'RWD',
      'RWT',
      'SCO',
      'VHK',
      'VVD',
      'VVK',
      'WRA',
      'WRA1',
      'WRA2',
      'WRA3',
      'WRA4',
      'WRA5',
    ],
    statusLineItems: { name: 'vergoeding', transformers: vergoeding },
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['FIE', 'FIN', 'MVV', 'MVW', 'VHK', 'VVK', 'AAN'],
    statusLineItems: { name: 'vergoeding', transformers: vergoeding },
  },
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: ['AOV'],
    statusLineItems: { name: 'AOV', transformers: AOV },
  },
  {
    leveringsVorm: 'PGB',
    productsoortCodes: ['AOV'],
    statusLineItems: { name: 'AOV', transformers: AOV },
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AOV'],
    statusLineItems: { name: 'AOV', transformers: AOV },
  },
];

export const PRODUCTS_WITH_DELIVERY: Record<LeveringsVorm, ProductSoortCode[]> =
  {};

for (const config of wmoStatusLineItemsConfig) {
  if (
    [diensten, WRA, hulpmiddelen].includes(config.statusLineItems.transformers)
  ) {
    if (
      typeof config.leveringsVorm !== 'undefined' &&
      config.productsoortCodes
    ) {
      if (!PRODUCTS_WITH_DELIVERY[config.leveringsVorm]) {
        PRODUCTS_WITH_DELIVERY[config.leveringsVorm] = [
          ...config.productsoortCodes,
        ];
      } else {
        PRODUCTS_WITH_DELIVERY[config.leveringsVorm].push(
          ...config.productsoortCodes
        );
      }
    }
  }
}
