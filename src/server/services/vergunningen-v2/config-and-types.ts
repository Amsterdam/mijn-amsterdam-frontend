import { ApiResponse } from '../../../universal/helpers';
import {
  GenericDocument,
  LinkProps,
  ZaakDetail,
} from '../../../universal/types';
import {
  CaseTypeV2,
  DecosCaseType,
  GetCaseType,
} from '../../../universal/types/vergunningen';

export const NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END = 3;
export const NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED = 3;

export const EXCLUDE_CASE_TYPES_FROM_VERGUNNINGEN_THEMA: DecosCaseType[] = [
  CaseTypeV2.VakantieverhuurVergunningaanvraag,
  CaseTypeV2.ExploitatieHorecabedrijf,
];

// Cases with this one of these dfunction values will not be included in the cases shown to the user.
export const DECOS_EXCLUDE_CASES_WITH_INVALID_DFUNCTION = [
  'buiten behandeling',
  'geannuleerd',
  'geen aanvraag of dubbel',
];

// Cases with one of these subject1 values will not be included in the cases shown to the user. Payment is not yet processed or failed.
export const DECOS_EXCLUDE_CASES_WITH_PENDING_PAYMENT_CONFIRMATION_SUBJECT1 = [
  'wacht op online betaling',
  'wacht op ideal betaling',
];

// Cases with this dfunction value will not be included in the cases shown to the user.
export const DECOS_PENDING_REMOVAL_DFUNCTION = '*verwijder';
// Cases with this text11 value will not be included in the cases shown to the user. Payment is not yet processed or failed.
export const DECOS_PENDING_PAYMENT_CONFIRMATION_TEXT11 = 'nogniet';
// Cases with this text12 value will not be included in the cases shown to the user. Payment is not yet processed or failed.
export const DECOS_PENDING_PAYMENT_CONFIRMATION_TEXT12 =
  'wacht op online betaling';

const adresBoekenBSN =
  process.env.BFF_DECOS_API_ADRES_BOEKEN_BSN?.split(',') ?? [];

const adresBoekenKVK =
  process.env.BFF_DECOS_API_ADRES_BOEKEN_KVK?.split(',') ?? [];

export const adresBoekenByProfileType: Record<ProfileType, string[]> = {
  private: adresBoekenBSN,
  commercial: adresBoekenKVK,
  'private-attributes': [],
};

export const MA_DECISION_DEFAULT = 'Zie besluit';

export type ZaakKenmerk = `Z/${number}/${number}`; // Z/23/2230346
export type DecosZaakID = string;
export type ZaakStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Afgehandeld'
  | string;

type MADecision = string;
type DecosDecision = string;

export type DecosFieldNameSource = string;
export type DecosFieldValue = string | number | boolean | null;

type DecosTransformerOptions<T extends VergunningV2 = VergunningV2> = {
  zaakTypeTransformer?: DecosZaakTypeTransformer<T>;
  fetchDecosWorkflowDate?: (
    stepTitle: DecosWorkflowStepTitle
  ) => Promise<ApiResponse<string | null>>;
};

export type DecosFieldTransformer<T extends VergunningV2 = VergunningV2> = {
  name: keyof T;
  transform?: (
    input: any,
    options?: DecosTransformerOptions<T>
  ) => DecosFieldValue;
};

export type DecosZaakTypeTransformer<T extends VergunningV2 = VergunningV2> = {
  // The caseType (zaaktype) of the sourceData.
  caseType: DecosCaseType;
  // Title of the VergunningV2, mostly a slightly different variant of the $caseType
  title: string;
  // A mapping object that can be used to assign a readable attribute to the data sent to the frontend.
  // For example: date6 becomes dateStart. Additionally a function can be provided to perform some compute on the value assigned to the sourceField.
  // For example String operations like, trim, split, uppercase etc.
  transformFields?: Partial<DecosFieldTransformerObject<T>>;
  // After transform is used to perform additional transformations after the initial transform.
  // Business logic is implemented at this point, also async calls to other services to enrich the data can be done here.
  afterTransform?: (
    vergunning: T,
    decosZaakSource: DecosZaakSource,
    options?: DecosTransformerOptions<T>
  ) => Promise<T>;
  // A function to check if the source data quality and/or prerequisites for showing the data to the user are valid.
  // This function is run before transformation of the zaak.
  hasValidSourceData?: (decosZaakSource: DecosZaakSource) => boolean;
  // Indicate if the zaak requires payment to be processed and complete. This function is run before transformation of the zaak.
  requirePayment?: boolean;
  // Decision (resultaat) values are generalized here. For example. The sourceValues can be one of: `Toegekend met borden`, `Toegekend zonder dingen` which we want to show to the user as `Toegekend`.
  decisionTranslations?: Record<MADecision, DecosDecision[]>;
  // The title of the workflow step that is used to find a date for the InBehandeling status.
  dateInBehandelingWorkflowStepTitle?: string;
  // Indicates if the Zaak should be shown to the user / is expected to be transformed.
  isActive: boolean;
  // Initially we request a set of fields to be included in the responseData (?select=). For some cases we need a (few) custom field(s) included in the initial response.
  // For example to show a kenteken in the Notifications. Sadly the requested fields cannot be specified on a case basis.
  // This means even though we do not want, for example, date7 for case A we will receive it anyway.
  // We select a specific set of fields because otherwise we receive all the fields of a zaak which are bloated and mostly unused.
  addToSelectFieldsBase?: string[];
  // Notifications for this specific
  notificationLabels?: Partial<NotificationLabelByType>;
};

type DecosZaakBase = {
  // status
  title: string;
  // caseType
  text45: DecosCaseType | string;
  // decision
  dfunction?: string | null;
  // identifier / zaaknummer
  mark: string;
  // processed
  processed: boolean;
  // dateDecision
  date5?: string | null;
  // dateRequest
  document_date: string;
  // dateStart
  date6?: string | null;
  // dateEnd
  date7?: string | null;

  subject1?: string;
  // Info regarding possible payment
  text11?: string | null;
  // Info regarding possible payment
  text12?: string | null;
};

type DecosDocumentBase = {
  text39: string;
  text40: string;
  text41: string;
  // identifier / zaaknummer
  mark: string;
  // datePublished
  received_date: string;
};

type DecosDocumentBlobBase = {
  // IS PDF
  bol10: boolean;
};

export type DecosFieldsObject = Record<
  DecosFieldNameSource,
  string | boolean | null | number
>;

export type DecosFieldTransformerObject<T extends VergunningV2 = VergunningV2> =
  Record<DecosFieldNameSource, DecosFieldTransformer<T> | keyof T>;

export type DecosZaakSource = {
  key: DecosZaakID;
  links: string[];
  fields: DecosZaakBase & DecosFieldsObject;
};

export type DecosDocumentSource = {
  key: DecosZaakID;
  links: string[];
  fields: DecosDocumentBase & DecosFieldsObject;
};

export type DecosDocumentBlobSource = {
  key: DecosZaakID;
  links: string[];
  fields: DecosDocumentBlobBase & DecosFieldsObject;
};

export type DecosZakenResponse<T = DecosZaakSource[]> = {
  count: number;
  content: T;
};

export type DecosResponse<T> = {
  itemDataResultSet: {
    content: T[];
  };
};

export type VergunningCaseTypeFilter = (vergunning: VergunningV2) => boolean;

export type AddressBookEntry = {
  key: string;
};

export type DecosWorkflowStepTitle = string;
export type DecosWorkflowStepDate = string;

export interface VergunningBase {
  caseType: DecosCaseType;
  dateDecision: string | null;
  dateInBehandeling: string | null;
  dateRequest: string;

  // DateStart and DateEnd are not applicable to every single vergunning but general enough to but in base Type.
  dateStart: string | null;
  dateEnd: string | null;

  decision: string | null;
  description: string;

  // Url to BFF Detail paga api
  fetchUrl: string;

  identifier: ZaakKenmerk;
  title: string;
  id: string;

  // Decos key (uuid) used as primary id's in api communication.
  key: string;

  processed: boolean;
  status: ZaakStatus;

  paymentStatus: string | null;
  paymentMethod: string | null;
}

export interface VergunningWithLocation extends VergunningBase {
  location: string | null;
}

export interface VergunningWithKentekens extends VergunningBase {
  kentekens: string | null;
}

export interface VergunningWithDateRange extends VergunningBase {
  dateStart: string | null;
  dateEnd: string | null;
}

export interface VergunningWithTimeRange extends VergunningBase {
  timeStart: string | null;
  timeEnd: string | null;
}

export interface VergunningWithDateTimeRange
  extends VergunningWithDateRange,
    VergunningWithTimeRange {}

export interface TVMRVVObject
  extends VergunningWithLocation,
    VergunningWithDateTimeRange,
    VergunningWithKentekens {
  caseType: GetCaseType<'TVMRVVObject'>;
}

export interface GPK extends VergunningWithLocation {
  caseType: GetCaseType<'GPK'>;
  cardType: 'driver' | 'passenger';
  cardNumber: number | null;
  dateEnd: string | null;
  requestReason: string | null;
}

export interface GPP extends VergunningWithLocation {
  caseType: GetCaseType<'GPP'>;
  kentekens: string | null;
}

export interface EvenementMelding
  extends VergunningWithLocation,
    VergunningWithDateTimeRange {
  caseType: GetCaseType<'EvenementMelding'>;
}

export interface EvenementVergunning
  extends VergunningWithLocation,
    VergunningWithDateTimeRange {
  caseType: GetCaseType<'EvenementVergunning'>;
}

export interface Omzettingsvergunning extends VergunningWithLocation {
  caseType: GetCaseType<'Omzettingsvergunning'>;
  dateInBehandeling: string | null;
}

export interface ERVV
  extends VergunningWithLocation,
    VergunningWithDateTimeRange {
  caseType: GetCaseType<'ERVV'>;
}

export interface VakantieverhuurVergunningaanvraag
  extends VergunningWithLocation,
    VergunningWithDateRange {
  caseType: GetCaseType<'VakantieverhuurVergunningaanvraag'>;
  title: 'VergunningV2 vakantieverhuur';
  decision: 'Verleend' | 'Ingetrokken';
}

export interface BBVergunning
  extends VergunningWithLocation,
    VergunningWithDateRange {
  caseType: GetCaseType<'BBVergunning'>;
  title: 'VergunningV2 bed & breakfast';
  decision: 'Verleend' | 'Geweigerd' | 'Ingetrokken';
  requester: string | null;
  owner: string | null;
  hasTransitionAgreement: boolean;
  dateInBehandeling: string | null;
}

// BZB is short for Parkeerontheffingen Blauwe zone bedrijven
export interface BZB extends VergunningWithDateRange {
  caseType: GetCaseType<'BZB'>;
  companyName: string | null;
  numberOfPermits: string | null;
  decision: string | null;
}

// BZP is short for Parkeerontheffingen Blauwe zone particulieren
export interface BZP extends VergunningWithDateRange, VergunningWithKentekens {
  caseType: GetCaseType<'BZP'>;
  kentekens: string | null;
  decision: string | null;
}

export interface Flyeren
  extends VergunningWithLocation,
    VergunningWithDateTimeRange {
  caseType: GetCaseType<'Flyeren'>;
  decision: 'Verleend' | 'Niet verleend' | 'Ingetrokken';
}

export interface AanbiedenDiensten
  extends VergunningWithLocation,
    VergunningWithDateRange {
  caseType: GetCaseType<'AanbiedenDiensten'>;
}

export interface Nachtwerkontheffing
  extends VergunningWithLocation,
    VergunningWithDateTimeRange {
  caseType: GetCaseType<'NachtwerkOntheffing'>;
}

export interface ZwaarVerkeer
  extends VergunningWithKentekens,
    VergunningWithDateRange {
  caseType: GetCaseType<'ZwaarVerkeer'>;
  exemptionKind: string | null;
}

export interface RVVHeleStad
  extends VergunningWithKentekens,
    VergunningWithDateRange {
  caseType: GetCaseType<'RVVHeleStad'>;
}

export interface RVVSloterweg
  extends VergunningWithKentekens,
    VergunningWithDateRange {
  caseType: GetCaseType<'RVVSloterweg'>;
  vorigeKentekens: string | null;
  dateWorkflowVerleend: string | null;
  requestType: 'Nieuw' | 'Wijziging';
  area: 'Sloterweg-West' | 'Laan van Vlaanderen' | 'Sloterweg-Oost';
  decision: 'Verlopen' | 'Ingetrokken' | 'Vervallen' | 'Verleend';
  status: ZaakStatus & 'Actief';
}

export interface TouringcarDagontheffing
  extends VergunningWithKentekens,
    VergunningWithDateTimeRange {
  caseType: GetCaseType<'TouringcarDagontheffing'>;
  destination: string | null;
}

export interface TouringcarJaarontheffing
  extends VergunningWithKentekens,
    VergunningWithDateRange {
  caseType: GetCaseType<'TouringcarJaarontheffing'>;
  destination: string | null;
  routetest: boolean;
}

export interface Samenvoegingsvergunning extends VergunningWithLocation {
  caseType: GetCaseType<'Samenvoegingsvergunning'>;
}

export interface Onttrekkingsvergunning extends VergunningWithLocation {
  caseType: GetCaseType<'Onttrekkingsvergunning'>;
}

export interface OnttrekkingsvergunningSloop extends VergunningWithLocation {
  caseType: GetCaseType<'OnttrekkingsvergunningSloop'>;
}

export interface VormenVanWoonruimte extends VergunningWithLocation {
  caseType: GetCaseType<'VormenVanWoonruimte'>;
}

export interface Splitsingsvergunning extends VergunningWithLocation {
  caseType: GetCaseType<'Splitsingsvergunning'>;
}

export interface ExploitatieHorecabedrijf
  extends VergunningWithLocation,
    VergunningWithDateRange {
  caseType: GetCaseType<'ExploitatieHorecabedrijf'>;
  dateStartPermit: string | null;
  numberOfPermits: string | null;
}

export interface Ligplaatsvergunning extends VergunningWithLocation {
  caseType: GetCaseType<'VOB'>;
  requestKind: string | null;
  reason: string | null;
  vesselKind: string | null;
  vesselName: string | null;
}

export interface Parkeerplaats {
  fiscalNumber: string;
  houseNumber: string;
  street: string;
  type: string;
  url: string;
}

export type EigenParkeerplaatsRequestType =
  | 'Nieuwe aanvraag'
  | 'Autodeelbedrijf'
  | 'Kentekenwijziging'
  | 'Verhuizing'
  | 'Verlenging';

export interface EigenParkeerplaats
  extends VergunningBase,
    VergunningWithKentekens,
    VergunningWithDateRange {
  caseType: GetCaseType<'EigenParkeerplaats'>;
  vorigeKentekens: string | null;
  requestTypes: EigenParkeerplaatsRequestType[];
  locations: Parkeerplaats[];
}

export interface EigenParkeerplaatsOpheffen extends VergunningBase {
  caseType: GetCaseType<'EigenParkeerplaatsOpheffen'>;
  isCarsharingpermit: boolean;
  dateEnd: string | null;
  location: Parkeerplaats;
}

export type WVOSActiviteit =
  | 'Rijden of een voertuig neerzetten waar dat normaal niet mag'
  | 'Object(en) neerzetten'
  | 'Parkeervakken reserveren'
  | 'Een straat afzetten'
  | 'Werkzaamheden verrichten in de nacht'
  | 'Fietsen en/of fietsenrekken weg laten halen voor werkzaamheden'
  | 'Verhuizing tussen twee locaties binnen Amsterdam'
  | 'Filmen';

export interface WerkzaamhedenEnVervoerOpStraat
  extends VergunningWithLocation,
    VergunningWithDateRange,
    VergunningWithKentekens {
  caseType: GetCaseType<'WVOS'>;
  werkzaamheden: WVOSActiviteit[];
}

export type VergunningV2 =
  | TVMRVVObject
  | GPK
  | GPP
  | EvenementMelding
  | EvenementVergunning
  | Omzettingsvergunning
  | ERVV
  | BZB
  | BZP
  | BBVergunning
  | VakantieverhuurVergunningaanvraag
  | Flyeren
  | AanbiedenDiensten
  | Nachtwerkontheffing
  | ZwaarVerkeer
  | Samenvoegingsvergunning
  | Onttrekkingsvergunning
  | OnttrekkingsvergunningSloop
  | VormenVanWoonruimte
  | Splitsingsvergunning
  | Ligplaatsvergunning
  | ExploitatieHorecabedrijf
  | RVVHeleStad
  | RVVSloterweg
  | EigenParkeerplaats
  | EigenParkeerplaatsOpheffen
  | TouringcarDagontheffing
  | TouringcarJaarontheffing
  | WerkzaamhedenEnVervoerOpStraat;

export type HorecaVergunningen = ExploitatieHorecabedrijf;

export type VergunningenSourceData = {
  content?: VergunningV2[];
  status: 'OK' | 'ERROR';
};

export type VergunningExpirable = VergunningV2 & { dateEnd?: string | null };

export type VergunningDocument = GenericDocument & { key: string };

export type VergunningenData = VergunningV2[];

export interface VergunningOptions {
  filter?: (vergunning: VergunningV2) => boolean;
  appRoute: string | ((vergunning: VergunningV2) => string);
}

export type VergunningFrontendV2<T extends VergunningV2 = VergunningV2> = T & {
  dateDecisionFormatted?: string | null;
  dateInBehandelingFormatted: string | null;
  dateRequestFormatted: string;
  dateStartFormatted?: string | null;
  dateEndFormatted?: string | null;
  isExpired?: boolean;
} & ZaakDetail;

export type VergunningFilter = (vergunning: VergunningV2) => boolean;

export type NotificationProperty =
  | 'title'
  | 'description'
  | 'datePublished'
  | 'link';

type NotificationPropertyValue = (
  vergunning: VergunningFrontendV2
) => string | null;

type NotificationLink = (vergunning: VergunningFrontendV2) => LinkProps;

export type NotificationLinks = {
  [key in VergunningFrontendV2['caseType']]?: string;
};

type NotificationLabelsBase = {
  [key in Exclude<NotificationProperty, 'link'>]: NotificationPropertyValue;
};

export interface NotificationLabels extends NotificationLabelsBase {
  link: NotificationLink;
}

export type NotificationTypeKey =
  | 'statusAanvraag'
  | 'statusInBehandeling'
  | 'statusAfgehandeld'
  | 'verlooptBinnenkort'
  | 'isVerlopen'
  | 'isIngetrokken';

export type NotificationLabelByType = Record<
  NotificationTypeKey,
  NotificationLabels
>;
