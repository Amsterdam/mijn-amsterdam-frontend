import { ApiResponse } from '../../../universal/helpers';
import {
  GenericDocument,
  LinkProps,
  StatusLine,
} from '../../../universal/types';
import {
  GetCaseType,
  DecosCaseType,
} from '../../../universal/types/vergunningen';

export const NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END = 3;

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
  process.env.BFF_DECOS_VERGUNNINGEN_ADRES_BOEKEN_BSN?.split(',') ?? [];

const adresBoekenKVK =
  process.env.BFF_DECOS_VERGUNNINGEN_ADRES_BOEKEN_KVK?.split(',') ?? [];

export const adresBoekenByProfileType: Record<ProfileType, string[]> = {
  private: adresBoekenBSN,
  commercial: adresBoekenKVK,
  'private-attributes': [],
};

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
};

export type DecosFieldsObject = Record<DecosFieldNameSource, string>;
export type DecosFieldTransformerObject<T extends VergunningV2 = VergunningV2> =
  Record<DecosFieldNameSource, DecosFieldTransformer<T> | keyof T>;
export type DecosZaakSource = {
  key: DecosZaakID;
  fields: DecosFieldsObject;
};

export type DecosZakenResponse = {
  count: number;
  content: DecosZaakSource[];
};

export type DecosResponse<T> = {
  itemDataResultSet: {
    content: T[];
  };
};

export type AddressBookEntry = {
  key: string;
};

export type DecosWorkflowStepTitle = string;
export type DecosWorkflowStepDate = string;

export interface VergunningBase extends StatusLine {
  caseType: DecosCaseType;
  status: ZaakStatus;
  title: string;
  description: string;
  identifier: ZaakKenmerk;
  dateRequest: string;
  dateInBehandeling: string | null;
  decision: string | null;
  dateDecision?: string | null;
  id: string;
  link: LinkProps;
  fetchUrl: string;
  processed: boolean;
}

export interface VergunningWithLocation extends VergunningBase {
  location: string | null;
}

export interface TVMRVVObject extends VergunningWithLocation {
  caseType: GetCaseType<'TVMRVVObject'>;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  kentekens: string | null;
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

export interface EvenementMelding extends VergunningWithLocation {
  caseType: GetCaseType<'EvenementMelding'>;
  timeStart: string | null;
  timeEnd: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface EvenementVergunning extends VergunningWithLocation {
  caseType: GetCaseType<'EvenementVergunning'>;
  timeStart: string | null;
  timeEnd: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface Omzettingsvergunning extends VergunningWithLocation {
  caseType: GetCaseType<'Omzettingsvergunning'>;
  dateInBehandeling: string | null;
}

export interface ERVV extends VergunningWithLocation {
  caseType: GetCaseType<'ERVV'>;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
}

export interface VakantieverhuurVergunningaanvraag
  extends VergunningWithLocation {
  caseType: GetCaseType<'VakantieverhuurVergunningaanvraag'>;
  title: 'VergunningV2 vakantieverhuur';
  dateStart: string | null;
  dateEnd: string | null;
  decision: 'Verleend' | 'Ingetrokken';
}

export interface BBVergunning extends VergunningWithLocation {
  caseType: GetCaseType<'BBVergunning'>;
  title: 'VergunningV2 bed & breakfast';
  decision: 'Verleend' | 'Geweigerd' | 'Ingetrokken';
  dateStart: string | null;
  dateEnd: string | null;
  requester: string | null;
  owner: string | null;
  hasTransitionAgreement: boolean;
  dateInBehandeling: string | null;
}

// BZB is short for Parkeerontheffingen Blauwe zone bedrijven
export interface BZB extends VergunningBase {
  caseType: GetCaseType<'BZB'>;
  companyName: string | null;
  numberOfPermits: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  decision: string | null;
}

// BZP is short for Parkeerontheffingen Blauwe zone particulieren
export interface BZP extends VergunningBase {
  caseType: GetCaseType<'BZP'>;
  kentekens: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  decision: string | null;
}

export interface Flyeren extends VergunningWithLocation {
  caseType: GetCaseType<'Flyeren'>;
  decision: 'Verleend' | 'Niet verleend' | 'Ingetrokken';
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
}

export interface AanbiedenDiensten extends VergunningWithLocation {
  caseType: GetCaseType<'AanbiedenDiensten'>;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface Nachtwerkontheffing extends VergunningWithLocation {
  caseType: GetCaseType<'NachtwerkOntheffing'>;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
}

export interface ZwaarVerkeer extends VergunningBase {
  caseType: GetCaseType<'ZwaarVerkeer'>;
  exemptionKind: string | null;
  kentekens: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface RVVHeleStad extends VergunningBase {
  caseType: GetCaseType<'RVVHeleStad'>;
  kentekens: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export interface RVVSloterweg extends VergunningBase {
  caseType: GetCaseType<'RVVSloterweg'>;
  kentekens: string | null;
  vorigeKentekens: string | null;
  dateWorkflowVerleend: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  requestType: 'Nieuw' | 'Wijziging';
  area: 'Sloterweg-West' | 'Laan van Vlaanderen' | 'Sloterweg-Oost';
  decision: 'Verlopen' | 'Ingetrokken' | 'Vervallen' | 'Verleend';
  status: ZaakStatus & 'Actief';
}

export interface TouringcarDagontheffing extends VergunningBase {
  caseType: GetCaseType<'TouringcarDagontheffing'>;
  dateStart: string | null;
  timeStart: string | null;
  dateEnd: string | null;
  timeEnd: string | null;
  kentekens: string | null;
  destination: string | null;
}

export interface TouringcarJaarontheffing extends VergunningBase {
  caseType: GetCaseType<'TouringcarJaarontheffing'>;
  dateStart: string | null;
  dateEnd: string | null;
  kentekens: string | null;
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

export interface ExploitatieHorecabedrijf extends VergunningWithLocation {
  caseType: GetCaseType<'ExploitatieHorecabedrijf'>;
  dateStart: string | null;
  dateEnd: string | null;
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

export interface EigenParkeerplaats extends VergunningBase {
  caseType: GetCaseType<'EigenParkeerplaats'>;
  kentekens: string | null;
  vorigeKentekens: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  locations: Parkeerplaats[];
  requestTypes: EigenParkeerplaatsRequestType[];
}

export interface EigenParkeerplaatsOpheffen extends VergunningBase {
  caseType: GetCaseType<'EigenParkeerplaatsOpheffen'>;
  isCarsharingpermit: boolean;
  location: Parkeerplaats;
  dateEnd: string | null;
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

export interface WerkzaamhedenEnVervoerOpStraat extends VergunningWithLocation {
  caseType: GetCaseType<'WVOS'>;
  dateStart: string | null;
  dateEnd: string | null;
  kentekens: string | null;
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

export type VergunningDetailType = Exclude<
  DecosCaseType,
  | 'B&B - vergunning'
  | 'Horeca vergunning exploitatie Horecabedrijf'
  | 'Vakantieverhuur vergunningsaanvraag'
>;

export type HorecaVergunningen = ExploitatieHorecabedrijf;

export type VergunningenSourceData = {
  content?: VergunningV2[];
  status: 'OK' | 'ERROR';
};

export type VergunningExpirable = VergunningV2 & { dateEnd?: string | null };

export interface VergunningDocument extends GenericDocument {
  sequence: number;
}

export type VergunningenData = VergunningV2[];

export interface VergunningOptions {
  filter?: (vergunning: VergunningV2) => boolean;
  appRoute: string | ((vergunning: VergunningV2) => string);
}
