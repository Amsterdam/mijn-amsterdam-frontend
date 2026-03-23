import type { SELECT_FIELDS_TRANSFORM_BASE } from './powerbrowser-field-transformers.ts';
import type { OmitMapped } from '../../../universal/helpers/utils.ts';
import type {
  GenericDocument,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types.ts';
import type { AuthProfile } from '../../auth/auth-types.ts';

export type NestedType<T> =
  T extends PowerBrowserZaakTransformer<infer R> ? R : never;

export interface PowerBrowserStatus {
  omschrijving: string | 'Ontvangen';
  datum: string;
}

export type PowerBrowserStatusResponse = PowerBrowserStatus[] | null;

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
  records?: PBRecord<T, F>[];
};

export type PBZaakFields =
  | PBRecordField<'ZAAK_IDENTIFICATIE'>
  | PBRecordField<'STARTDATUM'> // Startdatum van de zaak
  | PBRecordField<'EINDDATUM'> // Afhandeldatum zaak + Startdatum geldigheid vergunning
  | PBRecordField<'DATUM_TOT'> // Einddatum geldigheid vergunning
  | PBRecordField<'ZAAKPRODUCT_ID'>
  | PBRecordField<'ZAAK_SUBPRODUCT_ID'>
  | PBRecordField<'MUT_DAT'>
  | PBRecordField<'RESULTAAT_ID'>;
// ?fields=FMT_CAPTION,ZAAKPRODUCT_ID,MUT_DAT&offset&max&addSearch=false&enableIntrekProcedureCheck=false

export type PBZaakRecord = PBRecord<'GFO_ZAKEN', PBZaakFields[]>;

export type PBDocumentFields =
  | PBRecordField<'ID'>
  | PBRecordField<'OMSCHRIJVING'>
  | PBRecordField<'CREATEDATE'>
  | PBRecordField<'DOCUMENTNR'>
  | PBRecordField<'OPENBAARHEID_ID'>
  | PBRecordField<'SOORTDOCUMENT_ID'>
  | PBRecordField<'STAMCSSTATUS_ID'>
  | PBRecordField<'CREATOR_ID'>;

export type PBDocument = {
  [K in PBDocumentFields['fieldName']]: string;
};

export type PBDocumentRecord = PBRecord<'DOCLINK', PBDocumentFields[]>;

export type PBAdresLinkFields = PBRecordField<'FMT_CAPTION'>;

export type PBAdresLinkRecord = PBRecord<'ADRESSEN', PBAdresLinkFields[]>;

export const fieldMap: Partial<Record<PBZaakFields['fieldName'], string>> = {
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

export type PowerBrowserZaakBase = {
  caseType: string;
  id: string;
  identifier: string;
  title: string;

  dateRequest: string | null;
  dateDecision: string | null;
  dateStart: string;
  dateEnd: string | null;

  decision: string | null;
  isVerleend: boolean;
  documents: GenericDocument[];
  statusDates?: ZaakStatusDate[];

  processed: boolean;
  isExpired: boolean;
};

type CaseTypeLiteral<T extends PowerBrowserZaakBase> =
  unknown extends T['caseType']
    ? PowerBrowserZaakBase extends T // Allow unextended baseCase for easier internal function typing
      ? unknown
      : never
    : T['caseType'];

export type PowerBrowserZaakTransformer<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends PowerBrowserZaakBase = any,
  TF extends typeof SELECT_FIELDS_TRANSFORM_BASE & Record<string, string> =
    typeof SELECT_FIELDS_TRANSFORM_BASE & Record<string, string>,
> = {
  caseType: CaseTypeLiteral<T>;
  title: string;
  fetchZaakFilter: (field: PBRecord<'GFO_ZAKEN'>['fields'][0]) => boolean;
  transformFields: TF;
  transformFieldValues?: Partial<
    Record<keyof TF, (value: string | null) => string | null>
  >;
  transformDoclinks?: Record<string, Readonly<string[]>>;
  filterValidDocumentPredicate: (record: PBDocument) => boolean;
};

export type PowerBrowserZaakFrontend<
  T extends PowerBrowserZaakBase = PowerBrowserZaakBase,
> = OmitMapped<T, 'statusDates'> & {
  dateRequestFormatted: string | null;
  dateDecisionFormatted?: string | null;
  dateStartFormatted?: string | null;
  dateEndFormatted?: string | null;
} & ZaakAanvraagDetail;

export type ZaakStatusDate = {
  status: string;
  datePublished: string | null;
};
