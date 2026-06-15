// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- VSCODE insists on adding the type keywordt before import here, and it causes no issues.
import z from 'zod';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { voorzieningenRequestInput } from './jzd-service-config.ts';
import type {
  JzdApiConfig,
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

// This list should be kept in sync with the list of productIdentificaties given to us by JZD - Zorgned FB
const PRODUCT_IDS_EXCLUDED_FROM_REPARATIEVERZOEK_ACTION = [
  '13W13',
  '13W15',
  '13W37',
  '13W32',
  '13W33',
  '13W34',
  '13W49',
  '13W50',
  '13W55',
  '13W57',
  '13W85',
  '13W86',
  '13W94',
  '13W95',
  '13W98',
  '13W99',
  '13W44',
  '13W45',
  '13W46',
  '13W53',
  '13W54',
  '13W52',
  '13W73',
  '13W74',
  '13W82',
  '13W83',
];

export const wmoVoorzieningenApiConfig: JzdApiConfig[] = [
  // // // // // // // // // // // // // // // // // //
  // Reparatieverzoek action for WRA products  // // //
  // // // // // // // // // // // // // // // // // //
  {
    include: {
      isActueel: true,
      productsoortCode: ['WRA', 'WRA1', 'WRA2', 'WRA3', 'WRA4', 'WRA5'],
    },
    exclude: {
      productIdentificatie: PRODUCT_IDS_EXCLUDED_FROM_REPARATIEVERZOEK_ACTION,
    },
    assign: {
      maActies: ['reparatieverzoek'],
      maProductgroep: productGroep.WRA,
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
    include: {
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
            'https://www.amsterdam.nl/zorg-en-ondersteuning/contact/wmo-helpdesk/',
        };
      },
    },
    include: {
      leveringsVorm: (voorziening) => voorziening.leveringsVorm !== 'PGB',
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
    include: {
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
    include: {
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
    include: {
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
    include: {
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
    include: {
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
    include: {
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
    include: {
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
    include: {
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
    include: {
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
            'https://www.amsterdam.nl/zorg-en-ondersteuning/contact/wmo-helpdesk/',
        };
      },
    },
    include: {
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
    include: {
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
    include: {
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
        include: Object.fromEntries(
          entries(match).filter(([_, value]) => typeof value !== 'undefined')
        ) as JzdApiConfig['include'],
        assign: {
          maProductgroep: lineItemConfig.productgroep,
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
