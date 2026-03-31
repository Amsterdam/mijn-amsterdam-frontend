import { isBefore } from 'date-fns';
import type z from 'zod';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { voorzieningenRequestInput } from './wmo-service-config.ts';
import {
  productGroep,
  wmoStatusLineItemsConfig,
} from './wmo-status-line-items.ts';
import type {
  WmoApiConfig,
  ZorgnedAanvraagTransformedWithMaApiProps,
} from './wmo-types.ts';
import { entries } from '../../../universal/helpers/utils.ts';

export type FetchWmoVoorzieningenApiOptions = Omit<
  z.infer<typeof voorzieningenRequestInput>,
  'bsn'
>;

// These product.identificatie correspond to WRA products that can be repaired.
const PRODUCT_IDS_WITH_REPARATIEVERZOEK_ACTION = [
  '13W10',
  '13W11',
  '13W12',
  '13W14',
  '13W15',
  '13W18',
  '13W19',
  '13W20',
  '13W21',
  '13W22',
  '13W23',
  '13W24',
  '13W25',
  '13W26',
  '13W27',
  '13W28',
  '13W29',
  '13W30',
  '13W31',
  '13W32',
  '13W34',
  '13W40',
  '13W41',
  '13W42',
  '13W43',
  '13W44',
  '13W46',
  '13W47',
  '13W48',
  '13W50',
  '13W51',
  '13W52',
  '13W54',
  '13W55',
  '13W56',
  '13W57',
  '13W70',
  '13W71',
  '13W73',
  '13W74',
  '13W75',
  '13W76',
  '13W77',
  '13W78',
  '13W79',
  '13W80',
  '13W81',
  '13W82',
  '13W84',
  '13W90',
  '13W91',
  '13W92',
  '13W93',
  '13W94',
  '13W96',
];

export const wmoVoorzieningenApiConfig: WmoApiConfig[] = [
  // Reparatieverzoek action for WRA products with ZIN leveringsvorm
  {
    match: {
      leveringsVorm: 'ZIN',
      isActueel: true,
      datumEindeLevering: null,
      productIdentificatie: PRODUCT_IDS_WITH_REPARATIEVERZOEK_ACTION,
      // Only show reparatieverzoek action for products where the datumBeginLevering is in the past, to prevent showing this action for products that are not yet active.
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
  // Stopzetten actions
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
  // No specific actions assigned, but we still want to make these items available in the API for filtering based on productgroep.
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

export const PICK_VOORZIENING_KEYS = [
  'id',
  'titel',
  'procesIdentificatie',
  'procesMeldingIdentificatie',
  'beschikkingNummer',
  'productIdentificatie',
  'productsoortCode',
  'beschiktProductIdentificatie',
  'datumAanvraag',
  'datumBesluit',
  'datumBeginLevering',
  'datumEindeLevering',
  'datumIngangGeldigheid',
  'datumEindeGeldigheid',
  'datumOpdrachtLevering',
  'leverancier',
  'leverancierIdentificatie',
  'leveringsVorm',
  'resultaat',
  'maActies',
  'maCategorie',
  'maProductgroep',
] as (keyof ZorgnedAanvraagTransformedWithMaApiProps)[];
