import {
  GenericDocument,
  ZaakDetail,
} from '../../../universal/types/App.types';

export interface ToeristischeVerhuurRegistratieNumberSource {
  registrationNumber: string;
}

export interface ToeristischeVerhuurRegistratieHouse {
  city: string;
  houseLetter: string | null;
  houseNumber: string | null;
  houseNumberExtension: string | null;
  postalCode: string | null;
  street: string | null;
}

export interface LVVRegistratieSource {
  rentalHouse: ToeristischeVerhuurRegistratieHouse;
  registrationNumber: string;
  agreementDate: string | null;
}

export interface LVVRegistratie {
  address: string;
  registrationNumber: string;
  agreementDate: string | null;
  agreementDateFormatted: string | null;
}

export interface LVVRegistratiesSourceData {
  content: LVVRegistratie[];
}

export interface VakantieverhuurVergunning extends ZaakDetail {
  adres: string;
  dateDecision?: string | null;
  dateEnd: string;
  dateEndFormatted: string;
  dateReceived: string;
  dateStart: string;
  dateStartFormatted: string;
  documentsUrl: string | null;
  id: string;
  isActual: boolean;
  result: 'Verleend' | 'Ingetrokken' | null;
  status: string;
  zaaknummer: string;
  title: 'Vergunning vakantieverhuur';
}

export type PBRecordField<K extends string = string> = {
  fieldName: K;
  fieldValue?: string;
  text?: string;
};

export type PBRecord<T, F extends PBRecordField[] = PBRecordField[]> = {
  fields: F;
  fmtCpn: string;
  id: string;
  mainTableName: T;
};

export type SearchRequestResponse<
  T extends string,
  F extends PBRecordField[] = PBRecordField[],
> = {
  mainTableName: T;
  records: PBRecord<T, F>[];
};

export type PBZaakFields =
  | PBRecordField<'ZAAK_IDENTIFICATIE'>
  // | PBRecordField<'CREATEDATE'>
  | PBRecordField<'STARTDATUM'>
  | PBRecordField<'EINDDATUM'>
  | PBRecordField<'INGANGSDATUM'>
  | PBRecordField<'DATUM_TOT'>
  | PBRecordField<'RESULTAAT_ID'>;

export type PBZaakRecord = PBRecord<'GFO_ZAKEN', PBZaakFields[]>;

export type BBVergunningZaakStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Afgehandeld'
  | 'Verlopen'
  | null;
export type BBVergunningZaakResult =
  | 'Verleend'
  | 'Niet verleend'
  | 'Ingetrokken'
  | null;

export interface BBVergunning extends ZaakDetail {
  aanvrager: string | null;
  heeftOvergangsRecht: boolean;
  adres: string | null;
  dateReceived: string | null;
  dateDecision: string | null;
  dateStart: string;
  dateStartFormatted: string | null;
  dateEnd: string | null;
  dateEndFormatted: string | null;
  eigenaar: string | null;
  isActual: boolean;
  result: BBVergunningZaakResult;
  status: BBVergunningZaakStatus | BBVergunningZaakResult;
  zaaknummer: string;
  documents: GenericDocument[];
  title: 'Vergunning bed & breakfast';
}

export const fieldMap: Record<PBZaakFields['fieldName'], string> = {
  ZAAK_IDENTIFICATIE: 'zaaknummer',
  EINDDATUM: 'dateDecision',
  INGANGSDATUM: 'dateReceived',
  DATUM_TOT: 'dateEnd',
  RESULTAAT_ID: 'result',
  STARTDATUM: 'dateStart',
};

export type PBZaakStatus =
  | string
  | 'Gereed'
  | 'Intake'
  | 'In behandeling'
  | 'Geaccepteerd'
  | 'Afgehandeld'
  | 'Toetsen volledigheid'
  | 'Controle bezoek';

export type PBZaakResultaat =
  | null
  // | 'Niet van toepassing'
  // | 'Buiten behandeling'
  | 'Geweigerd'
  | 'Geweigerd op basis van Quotum'
  | 'Verleend met overgangsrecht'
  | 'Verleend zonder overgangsrecht'
  | 'Verleend'
  | 'Ingetrokken';

export type PBZaakCompacted = {
  zaaknummer: string | null;
  dateStart: string | null;
  dateReceived: string | null;
  dateDecision: string | null;
  dateEnd: string | null;
  result: PBZaakResultaat | null;
  status: PBZaakStatus | null;
};
