import type {
  LeveringsVorm,
  ProductSoortCode,
  ZorgnedStatusLineItemsConfig,
} from '../zorgned/zorgned-types.ts';
import { WMO_AFWIJZING_ALL } from './status-line-items/wmo-afwijzing-all.ts';
import { AOV } from './status-line-items/wmo-aov.ts';
import { diensten } from './status-line-items/wmo-diensten.ts';
import { hulpmiddelen } from './status-line-items/wmo-hulpmiddelen.ts';
import { PGB } from './status-line-items/wmo-pgb.ts';
import { vergoeding } from './status-line-items/wmo-vergoeding.ts';
import { WRA } from './status-line-items/wmo-wra.ts';
import { featureToggle } from './wmo-service-config.ts';

export const productGroep = {
  WRA: 'WRA',
  hulpmiddelen: 'hulpmiddelen',
  diensten: 'diensten',
  PGB: 'PGB',
  vergoeding: 'vergoeding',
  AOV: 'AOV',
};

export const wmoStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  // For all rejection decisions from aanvraag to final decision.
  {
    productgroep: 'Alle afgewezen',
    resultaat: 'afgewezen',
    statusLineItems: {
      transformers: WMO_AFWIJZING_ALL,
    },
    isDisabled:
      !featureToggle.statusLineItems.alleAfgewezenWmoAanvragen.isEnabled,
  },
  {
    productgroep: productGroep.WRA,
    resultaat: 'toegewezen',
    leveringsVorm: 'ZIN',
    productsoortCodes: ['ZIN', 'WRA', 'WRA1', 'WRA2', 'WRA3', 'WRA4', 'WRA5'],
    statusLineItems: { transformers: WRA },
  },
  {
    productgroep: productGroep.hulpmiddelen,
    resultaat: 'toegewezen',
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
      'ORW',
    ],
    statusLineItems: {
      transformers: hulpmiddelen,
    },
  },
  {
    productgroep: productGroep.diensten,
    resultaat: 'toegewezen',
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
      'AWBG',
      'BSW',
      'DBA',
      'DBH',
      'DBL',
      'DBS',
      'KVB',
      'LGO',
      'MAO',
      'WMH',
    ],
    statusLineItems: { transformers: diensten },
  },
  {
    productgroep: productGroep.diensten,
    resultaat: 'toegewezen',
    leveringsVorm: '',
    productsoortCodes: ['AO2', 'AO5', 'DBS', 'KVB', 'WMH', 'AWBG', 'MAO'],
    statusLineItems: { transformers: diensten },
  },
  {
    productgroep: productGroep.PGB,
    resultaat: 'toegewezen',
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
    statusLineItems: { transformers: PGB },
  },
  {
    productgroep: productGroep.vergoeding,
    resultaat: 'toegewezen',
    leveringsVorm: 'ZIN',
    productsoortCodes: ['FIN', 'MVV', 'MVW', 'VHK', 'VVD'],
    statusLineItems: {
      transformers: vergoeding,
    },
  },
  {
    productgroep: productGroep.vergoeding,
    resultaat: 'toegewezen',
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
      'WRA',
      'WRA1',
      'WRA2',
      'WRA3',
      'WRA4',
      'WRA5',
      'ORO',
      'ORW',
    ],
    statusLineItems: {
      transformers: vergoeding,
    },
  },
  {
    productgroep: productGroep.vergoeding,
    resultaat: 'toegewezen',
    leveringsVorm: '',
    productsoortCodes: ['FIE', 'FIN', 'MVV', 'MVW', 'VHK', 'VVK', 'AAN'],
    statusLineItems: {
      transformers: vergoeding,
    },
  },
  {
    productgroep: productGroep.AOV,
    // Alle leveringsvormen voor AOV
    resultaat: 'toegewezen',
    productsoortCodes: ['AOV'],
    statusLineItems: { transformers: AOV },
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
