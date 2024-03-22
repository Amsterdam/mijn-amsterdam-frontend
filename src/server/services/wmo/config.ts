import {
  GenericDocument,
  LinkProps,
  StatusLineItem,
} from '../../../universal/types';

export type LeveringsVorm = 'ZIN' | 'PGB' | '';
export type ProductSoortCode = string;

export const ZORGNED_GEMEENTE_CODE = '0363';
export const REGELING_IDENTIFICATIE = 'wmo';
export const BESCHIKTPRODUCT_RESULTAAT = ['toegewezen'];
export const DATE_END_NOT_OLDER_THAN = '2018-01-01';
export const MINIMUM_REQUEST_DATE_FOR_DOCUMENTS = new Date('2022-01-01'); // After this date documents are WCAG proof.

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

interface Levering {
  begindatum: string;
  einddatum: string;
}

interface Toewijzing {
  leveringen: Levering[];
  datumOpdracht: string;
}

interface Leverancier {
  omschrijving: string;
}

export type BeschikkingsResultaat = 'toegewezen' | string;

export interface BeschiktProduct {
  toegewezenProduct: {
    actueel: boolean;
    datumEindeGeldigheid: string;
    datumIngangGeldigheid: string;
    toewijzingen: Toewijzing[];
    leveringsvorm: LeveringsVorm;
    leverancier: Leverancier;
  };
  product: {
    productsoortCode: ProductSoortCode;
    omschrijving: string;
  };
  resultaat: BeschikkingsResultaat;
}

interface Beschikking {
  beschikkingNummer: string;
  datumAfgifte: string;
  beschikteProducten: BeschiktProduct[];
}

export interface ZorgnedDocument {
  documentidentificatie: string;
  omschrijving: string;
  datumDefinitief: string;
  zaakidentificatie: string;
}

export interface ZorgnedDocumentData {
  title: string;
  mimetype: string;
  data: Buffer;
}

export interface WMOAanvraag {
  identificatie: string;
  beschikking: Beschikking;
  datumAanvraag: string;
  documenten: ZorgnedDocument[];
}

export interface WMOVoorziening {
  id: string;
  datumBesluit: string;
  datumEindeGeldigheid: string;
  datumIngangGeldigheid: string;
  documenten: GenericDocument[];
  isActueel: boolean;
  leverancier: string;
  datumEindeLevering: string;
  datumBeginLevering: string;
  leveringsVorm: LeveringsVorm;
  productsoortCode: ProductSoortCode;
  titel: string;
  datumOpdrachtLevering: string;
}

export type TextPartContent = string;
export type TextPartContentFormatter = (
  data: WMOVoorziening,
  today: Date
) => TextPartContent;
export type TextPartContents = TextPartContent | TextPartContentFormatter;

export type LeveringsVormConfig = Record<LeveringsVorm, ProductSoortCode[]>;

export type WMOStatusLineItemFormatterConfig = {
  status: string;
  datePublished: TextPartContents;
  description: TextPartContents;
  isChecked: (stepIndex: number, data: WMOVoorziening, today: Date) => boolean;
  isActive: (stepIndex: number, data: WMOVoorziening, today: Date) => boolean;
  isVisible?: (stepIndex: number, data: WMOVoorziening, today: Date) => boolean;
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
  dateStart: string;
  dateEnd: string;
}
