import { parseISO } from 'date-fns';
import { LinkProps, StatusLineItem } from '../../../universal/types';
import {
  LeveringsVorm,
  ProductSoortCode,
} from '../zorgned/zorgned-config-and-types';

export const SINGLE_DOC_TITLE_BESLUIT = 'Brief';

export const REGELING_IDENTIFICATIE = 'wmo';
export const BESCHIKTPRODUCT_RESULTAAT = ['toegewezen'];
export const DATE_END_NOT_OLDER_THAN = '2018-01-01';
export const MINIMUM_REQUEST_DATE_FOR_DOCUMENTS = parseISO('2022-01-01'); // After this date documents are WCAG proof.

export const PRODUCTS_WITH_DELIVERY: Record<LeveringsVorm, ProductSoortCode[]> =
  {
    ZIN: [
      'ZIN',
      'WRA',
      'WRA1',
      'WRA2',
      'WRA3',
      'WRA4',
      'WRA5',
      'AAN',
      'AUT',
      'FIE',
      'GBW',
      'OVE',
      'ROL',
      'RWD',
      'RWT',
      'SCO',
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
    ],
    '': ['AO2', 'AO5', 'DBS', 'KVB', 'WMH', 'AAN', 'FIE'],
    PGB: [],
  };

export interface WMOVoorzieningFrontend {
  id: string;
  title: string; // Omschrijving
  supplier: string | null; // Leverancier
  isActual: boolean; // Indicates if this item is designated Current or Previous
  link: LinkProps;
  steps: StatusLineItem[];
  itemTypeCode: ProductSoortCode;
  dateDescision: string;
  resultaat: string;
  dateStart: string | null;
  dateEnd: string | null;
}
