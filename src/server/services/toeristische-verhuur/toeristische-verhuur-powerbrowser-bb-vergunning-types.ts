import { GenericDocument, ZaakDetail } from '../../../universal/types';
import { AuthProfile } from '../../auth/auth-types';

export interface PowerBrowserStatus {
  omschrijving: string | 'Ontvangen';
  datum: string;
}

export type PowerBrowserStatusResponse = PowerBrowserStatus[];

export type FetchZaakIdsOptions = {
  personOrMaatschapId: string;
  tableName: 'PERSONEN' | 'MAATSCHAP';
};

export type FetchPersoonOrMaatschapIdByUidOptions = {
  profileID: AuthProfile['id'];
  tableName: 'PERSONEN' | 'MAATSCHAP';
  fieldName: 'BURGERSERVICENUMMER' | 'KVKNUMMER';
};

// Bead & Breakfast vergunningen (Powerbrowser)
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
  | PBRecordField<'STARTDATUM'> // Startdatum van de zaak
  | PBRecordField<'EINDDATUM'> // Afhandeldatum zaak + Startdatum geldigheid vergunning
  | PBRecordField<'DATUM_TOT'> // Einddatum geldigheid vergunning
  | PBRecordField<'RESULTAAT_ID'>;

export type PBZaakRecord = PBRecord<'GFO_ZAKEN', PBZaakFields[]>;

export type PBDocumentFields =
  | PBRecordField<'ID'>
  | PBRecordField<'OMSCHRIJVING'>
  | PBRecordField<'CREATEDATE'>
  | PBRecordField<'DOCUMENTNR'>;

export type PBDocumentRecord = PBRecord<'DOCLINK', PBDocumentFields[]>;

export type PBAdresLinkFields = PBRecordField<'FMT_CAPTION'>;

export type PBAdresLinkRecord = PBRecord<'ADRESSEN', PBAdresLinkFields[]>;

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
  | string
  | null;

export interface BBVergunning extends ZaakDetail {
  adres: string | null;
  dateDecision: string | null;
  dateEnd: string | null;
  dateEndFormatted: string | null;
  dateRequest: string | null;
  dateRequestFormatted: string | null;
  dateStart: string;
  dateStartFormatted: string | null;
  decision: BBVergunningZaakResult;
  documents: GenericDocument[];
  heeftOvergangsRecht: boolean;
  identifier: string;
  processed: boolean;
  status: BBVergunningZaakStatus | BBVergunningZaakResult;
  title: 'Vergunning bed & breakfast';
}

export const fieldMap: Record<PBZaakFields['fieldName'], string> = {
  ZAAK_IDENTIFICATIE: 'zaaknummer',
  EINDDATUM: 'dateDecision',
  DATUM_TOT: 'dateEnd',
  RESULTAAT_ID: 'result',
  STARTDATUM: 'dateReceived',
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
  | 'Geweigerd'
  | 'Geweigerd op basis van Quotum'
  | 'Verleend met overgangsrecht'
  | 'Verleend zonder overgangsrecht'
  | 'Verleend'
  | 'Buiten behandeling'
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
