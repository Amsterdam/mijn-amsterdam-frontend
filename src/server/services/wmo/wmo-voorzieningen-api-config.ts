import { isBefore } from 'date-fns';
import type z from 'zod';

import type { voorzieningenRequestInput } from './wmo-service-config.ts';
import {
  productGroep,
  wmoStatusLineItemsConfig,
} from './wmo-status-line-items.ts';
import type { WmoAapiConfig } from './wmo-types.ts';
import { entries } from '../../../universal/helpers/utils.ts';

export type FetchWmoVoorzieningenApiOptions = {
  maActies: z.infer<typeof voorzieningenRequestInput>['maActies'];
  maProductgroep?: z.infer<typeof voorzieningenRequestInput>['maProductgroep'];
};

export const wmoVoorzieningenApiConfig: WmoAapiConfig[] = [
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
        ) as WmoAapiConfig['match'],
        assign: {
          maProductgroep: [lineItemConfig.productgroep],
        },
      };
    }),
] as const;
