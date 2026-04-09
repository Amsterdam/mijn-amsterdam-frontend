import type z from 'zod';

import type { voorzieningenRequestInput } from './jzd-service-config.ts';
import type {
  WmoApiConfig,
  ZorgnedAanvraagTransformedWithMaApiProps,
} from './jzd-types.ts';
import {
  productGroep,
  wmoStatusLineItemsConfig,
} from './wmo/wmo-status-line-items.ts';
import { entries } from '../../../universal/helpers/utils.ts';

export type FetchWmoVoorzieningenApiOptions = Omit<
  z.infer<typeof voorzieningenRequestInput>,
  'bsn'
>;

// These productIdentificaties correspond to WRA products that can be repaired.
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
  // // // // // // // // // // // // // // // // // // // // // // // // //
  // Reparatieverzoek action for WRA products with ZIN leveringsvorm // // //
  // // // // // // // // // // // // // // // // // // // // // // // // //
  {
    match: {
      leveringsVorm: 'ZIN',
      isActueel: true,
      productIdentificatie: PRODUCT_IDS_WITH_REPARATIEVERZOEK_ACTION,
    },
    assign: {
      maActies: ['reparatieverzoek'],
      maProductgroep: [productGroep.WRA],
    },
  },
  // // // // // // // // // //
  // Stopzetten actions // // //
  // // // // // // // // // //

  /////////////////////////////
  // Leerlingenvervoer ////////
  /////////////////////////////
  {
    assign: {
      maCategorie: ['A-LLV'],
      maActies: ['stopzetten', 'stopzetten-tijdelijk'],
    },
    match: {
      isActueel: true,
      productIdentificatie: [
        'LLVFV',
        'LLVOVA',
        'LLVOVV',
        'LLVEV',
        'LLVAV',
        'LLVAVG',
      ],
    },
  },
  //////////////////////////////////////////////////////
  // Stopzetten via content pagina verwijzingen ////////
  //////////////////////////////////////////////////////
  {
    assign: {
      maCategorie: ['B-WMO'],
      maActies: ['stopzetten-niet-via-formulier'],
      maActieUrls: () => {
        // TODO: possibly return different URLs based on the specific productgroep or other properties of the voorziening.
        return {
          'stopzetten-niet-via-formulier':
            'https://www.amsterdam.nl/stopzetten-wmo-voorziening',
        };
      },
    },
    match: {
      leveringsVorm: '',
      isActueel: true,
      productsoortCode: [
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
        'DT',
        'KVB',
        'LGO',
        'MAO',
        'WMH',
      ],
    },
  },
  /////////////////////////////
  // PGB HBH //////////////////
  /////////////////////////////
  {
    assign: {
      maCategorie: ['C-01'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: 'PGB',
      isActueel: true,
      productsoortCode: ['WMH'],
    },
  },
  /////////////////////////////
  // Pgb DB/LO/BV/AIO /////////
  /////////////////////////////
  {
    assign: {
      maCategorie: ['C-02'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: 'PGB',
      isActueel: true,
      productsoortCode: [
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
        'DT',
        'KVB',
        'LGO',
        'MAO',
      ],
    },
  },
  /////////////////////////////////////////
  // PGB Vervoer naar dagbesteding ////////
  /////////////////////////////////////////
  {
    assign: {
      maCategorie: ['C-03'],
      maActies: ['stopzetten', 'stopzetten-tijdelijk'],
    },
    match: {
      leveringsVorm: 'PGB',
      isActueel: true,
      productsoortCode: ['VVD'],
    },
  },
  /////////////////////////////
  // Hulpmiddelen (ZIN) ///////
  /////////////////////////////
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
  /////////////////////////////
  // Hulpmiddelen (PGB) ///////
  /////////////////////////////
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
  ////////////////////////////////////////
  // Woonruimte aanpassingen (ZIN) ///////
  ////////////////////////////////////////
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
  //////////////////////////////////////////////////////
  // Woonruimte aanpassingen en trapliften (PGB) ///////
  //////////////////////////////////////////////////////
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
  /////////////////////
  // Trapliften ///////
  /////////////////////
  {
    assign: {
      maCategorie: ['D-05'],
      maActies: ['stopzetten'],
    },
    match: {
      isActueel: true,
      productsoortCode: ['WRA1'],
    },
  },
  /////////////////////////
  // Vervoerskosten ///////
  /////////////////////////
  {
    assign: {
      maCategorie: ['D-06'],
      maActies: ['stopzetten'],
    },
    match: {
      isActueel: true,
      productsoortCode: ['FIN', 'MVV', 'VVK'],
    },
  },
  //////////////////////////////////
  // Verhuiskostenvergoeding ///////
  //////////////////////////////////
  {
    assign: {
      maCategorie: ['D-07'],
      maActies: ['stopzetten-niet-via-formulier'],
      maActieUrls: () => {
        // TODO: possibly return different URLs based on the specific productgroep or other properties of the voorziening.
        return {
          'stopzetten-niet-via-formulier':
            'https://www.amsterdam.nl/stopzetten-wmo-voorziening',
        };
      },
    },
    match: {
      isActueel: true,
      productsoortCode: ['VHK'],
    },
  },
  /////////////////////
  // Oplaadpunt ///////
  /////////////////////
  {
    assign: {
      maCategorie: ['D-08'],
      maActies: ['stopzetten'],
    },
    match: {
      isActueel: true,
      productsoortCode: ['WRA4'],
    },
  },
  //////////////////////////////////////////
  // AOV aanvullend openbaar vervoer ///////
  //////////////////////////////////////////
  {
    assign: {
      maCategorie: ['E-01'],
      maActies: ['stopzetten'],
    },
    match: {
      isActueel: true,
      productsoortCode: ['AOV'],
    },
  },
  // // // // // // // // // // // // // // // // // // // // // // // // //
  // No specific actions assigned, but we still want to make these items available in the API for filtering based on productgroep.
  // // // // // // // // // // // // // // // // // // // // // // // // //
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
  'maActieUrls',
] as (keyof ZorgnedAanvraagTransformedWithMaApiProps)[];
