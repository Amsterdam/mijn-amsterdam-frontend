import { FeatureToggle } from '../../../../universal/config/app';
import { StatusLineItem } from '../../../../universal/types';
import {
  LeveringsVorm,
  LeveringsVormConfig,
  ProductSoortCode,
  WMOStatusLineItemFormatterConfig,
  WMOVoorziening,
} from '../config-and-types';
import { parseLabelContent } from './helpers';
import { AOV } from './wmo-aov';
import { diensten } from './wmo-diensten';
import { hulpmiddelen } from './wmo-hulpmiddelen';
import { PGB } from './wmo-pgb';
import { vergoeding } from './wmo-vergoeding';
import { WRA } from './wmo-wra';

export interface WMOStatusLineItemsConfigFormatter {
  leveringsVorm: LeveringsVorm;
  productsoortCodes: ProductSoortCode[];
  lineItemFormatters: WMOStatusLineItemFormatterConfig[];
}

const voorzieningenConfig: WMOStatusLineItemsConfigFormatter[] = [
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: ['ZIN', 'WRA', 'WRA1', 'WRA2', 'WRA3', 'WRA4', 'WRA5'],
    lineItemFormatters: WRA,
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
    ],
    lineItemFormatters: hulpmiddelen,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AAN', 'FIE'],
    lineItemFormatters: hulpmiddelen,
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
    ],
    lineItemFormatters: diensten,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AO2', 'AO5', 'DBS', 'KVB', 'WMH', 'AWBG'],
    lineItemFormatters: diensten,
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
    lineItemFormatters: PGB,
  },
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: ['FIN', 'MVV', 'MVW', 'VHK', 'VVD', 'VVK'],
    lineItemFormatters: vergoeding,
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
    lineItemFormatters: vergoeding,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['FIE', 'FIN', 'MVV', 'MVW', 'VHK', 'VVK'],
    lineItemFormatters: vergoeding,
  },
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: ['AOV'],
    lineItemFormatters: AOV,
  },
  {
    leveringsVorm: 'PGB',
    productsoortCodes: ['AOV'],
    lineItemFormatters: AOV,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AOV'],
    lineItemFormatters: AOV,
  },
];

function getStatusLineItemFormatters(voorziening: WMOVoorziening) {
  return voorzieningenConfig.find((config) => {
    return (
      voorziening.leveringsVorm === config.leveringsVorm &&
      config.productsoortCodes.includes(voorziening.productsoortCode)
    );
  })?.lineItemFormatters;
}

export function getStatusLineItems(voorziening: WMOVoorziening, today: Date) {
  const lineItemFormatters = getStatusLineItemFormatters(voorziening);

  if (!lineItemFormatters) {
    console.log(
      `No line item formatters found for leveringsVorm: ${voorziening.leveringsVorm}, productsoortCode: ${voorziening.productsoortCode}`
    );
    return null;
  }

  const statusLineItems: StatusLineItem[] = lineItemFormatters
    .map((statusItem, index) => {
      const datePublished = parseLabelContent(
        statusItem.datePublished,
        voorziening,
        today
      ) as string;

      const stepData: StatusLineItem = {
        id: `status-step-${index}`,
        status: statusItem.status,
        description: parseLabelContent(
          statusItem.description,
          voorziening,
          today
        ),
        datePublished,
        isActive: statusItem.isActive(index, voorziening, today),
        isChecked: statusItem.isChecked(index, voorziening, today),
        isVisible: statusItem.isVisible
          ? statusItem.isVisible(index, voorziening, today)
          : true,
        documents:
          FeatureToggle.zorgnedDocumentAttachmentsActive &&
          statusItem.status === 'Besluit' &&
          voorziening.documenten?.length === 1
            ? voorziening.documenten
            : [],
      };

      if (index === 0 && stepData.documents?.length !== 1) {
        stepData.altDocumentContent = `<p>
            <strong>
              ${
                voorziening.isActueel
                  ? 'U krijgt dit besluit per post.'
                  : 'U hebt dit besluit per post ontvangen.'
              }
            </strong>
          </p>`;
      }

      return stepData.isVisible ? stepData : null;
    })
    .filter(Boolean) as StatusLineItem[];

  return statusLineItems;
}
