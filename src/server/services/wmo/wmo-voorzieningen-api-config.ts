import { isBefore } from 'date-fns';
import type z from 'zod';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { voorzieningenRequestInput } from './wmo-service-config.ts';
import {
  productGroep,
  wmoStatusLineItemsConfig,
} from './wmo-status-line-items.ts';
import type { WmoApiConfig } from './wmo-types.ts';
import { entries } from '../../../universal/helpers/utils.ts';

export type FetchWmoVoorzieningenApiOptions = {
  maActies?: z.infer<typeof voorzieningenRequestInput>['maActies'];
  maProductgroep?: z.infer<typeof voorzieningenRequestInput>['maProductgroep'];
};

export const wmoVoorzieningenApiConfig: WmoApiConfig[] = [
  {
    match: {
      leveringsVorm: 'ZIN',
      isActueel: true,
      productsoortCode: ['ZIN', 'WRA', 'WRA1', 'WRA2', 'WRA3', 'WRA4', 'WRA5'],
      datumEindeLevering: null,
      datumBeginLevering: (voorziening) =>
        voorziening.datumBeginLevering
          ? isBefore(voorziening.datumBeginLevering, new Date())
          : false,
    },
    assign: {
      maActies: ['reparatieverzoek'],
      maProductgroep: [productGroep.WRA],
    },
  },
  {
    assign: {
      maCategorie: ['D-01'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: 'ZIN',
      isActueel: true,
      productsoortCode: [
        'AAN',
        'AUT',
        'GBW',
        'FIE',
        'ROL',
        'SCO',
        'OVE',
        'RWD',
        'RWT',
      ],
    },
  },
  {
    assign: {
      maCategorie: ['D-02'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: 'PGB',
      isActueel: true,
      productsoortCode: ['AAN', 'FIE', 'ROL', 'SCO', 'OVE', 'RWD', 'RWT'],
    },
  },
  {
    assign: {
      maCategorie: ['D-03'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: 'ZIN',
      isActueel: true,
      productsoortCode: ['WGW', 'WRA', 'WRA2', 'WRA3', 'WRA5', 'OVW'],
    },
  },
  {
    assign: {
      maCategorie: ['D-04'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: 'PGB',
      isActueel: true,
      productsoortCode: ['WGW', 'WRA', 'WRA2', 'WRA3', 'WRA5', 'OVW', 'WRA1'],
    },
  },
  {
    assign: {
      maCategorie: ['D-05'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: '',
      isActueel: true,
      productsoortCode: ['WRA1'],
    },
  },
  {
    assign: {
      maCategorie: ['D-06'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: '',
      isActueel: true,
      productsoortCode: ['FIN', 'MVV', 'VVK'],
    },
  },
  {
    assign: {
      maCategorie: ['D-07'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: '',
      isActueel: true,
      productsoortCode: ['VHK'],
    },
  },
  {
    assign: {
      maCategorie: ['D-08'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: '',
      isActueel: true,
      productsoortCode: ['WRA4'],
    },
  },
  // Make all the productgroups available for retrieval via the API, even if no specific actions are assigned to them.
  ...wmoStatusLineItemsConfig
    .filter((lineItemConfig) => {
      return lineItemConfig.isDisabled !== true;
    })
    .map((lineItemConfig) => {
      const match = {
        leveringsVorm: lineItemConfig.leveringsVorm,
        resultaat: lineItemConfig.resultaat,
        productsoortCode: lineItemConfig.productsoortCodes,
      };

      return {
        match: Object.fromEntries(
          entries(match).filter(([_, value]) => typeof value !== 'undefined')
        ) as WmoApiConfig['match'],
        assign: {
          maProductgroep: [lineItemConfig.productgroep],
        },
      };
    }),
] as const;
