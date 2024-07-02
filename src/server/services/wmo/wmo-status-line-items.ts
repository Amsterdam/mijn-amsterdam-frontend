import { ZorgnedStatusLineItemsConfig } from '../zorgned/zorgned-config-and-types';
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
    lineItemTransformers: WRA,
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
    lineItemTransformers: hulpmiddelen,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AAN', 'FIE'],
    lineItemTransformers: hulpmiddelen,
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
    lineItemTransformers: diensten,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AO2', 'AO5', 'DBS', 'KVB', 'WMH', 'AWBG'],
    lineItemTransformers: diensten,
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
    lineItemTransformers: PGB,
  },
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: ['FIN', 'MVV', 'MVW', 'VHK', 'VVD', 'VVK'],
    lineItemTransformers: vergoeding,
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
    lineItemTransformers: vergoeding,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['FIE', 'FIN', 'MVV', 'MVW', 'VHK', 'VVK'],
    lineItemTransformers: vergoeding,
  },
  {
    leveringsVorm: 'ZIN',
    productsoortCodes: ['AOV'],
    lineItemTransformers: AOV,
  },
  {
    leveringsVorm: 'PGB',
    productsoortCodes: ['AOV'],
    lineItemTransformers: AOV,
  },
  {
    leveringsVorm: '',
    productsoortCodes: ['AOV'],
    lineItemTransformers: AOV,
  },
];
