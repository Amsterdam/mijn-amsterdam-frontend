import { SomeOtherString } from '../../../universal/helpers/types';
import { GenericDocument, ZaakDetail } from '../../../universal/types';
import { NotificationLabelByType } from '../vergunningen/config-and-types';

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

type DecosLinksSource = {
  rel: string;
  href: string;
};

export type DecosFieldsObject = Record<
  DecosFieldNameSource,
  string | boolean | null | number
>;

export type DecosFieldTransformerObject<
  T extends DecosZaakBase = DecosZaakBase,
> = Record<DecosFieldNameSource, DecosFieldTransformer<T> | keyof T>;

export type DecosContent<T> = {
  key: DecosZaakID;
  fields: T;
  links: DecosLinksSource[];
};

export type DecosZaakSource = DecosContent<
  DecosZaakFieldsSource & DecosFieldsObject
>;
export type DecosDocumentSource = DecosContent<
  DecosDocumentBase & DecosFieldsObject
>;

export type DecosDocumentBlobSource = DecosContent<
  DecosDocumentBlobBase & DecosFieldsObject
>;

export type DecosTermijn = {
  type: ZaakStatus;
  description?: string;
  dateStart: string;
  dateEnd: string;
  numberOfDays?: number;
};

export type DecosWorkflowSource = DecosContent<DecosWorkflowFieldsSource>;
export type DecosTermijnSource = DecosContent<DecosTermijnFieldsSource>;

export type DecosZakenResponse<T = DecosZaakSource[]> = {
  count: number;
  content: T;
};
export type DecosWorkflowResponse = DecosZakenResponse<DecosWorkflowSource[]>;
export type DecosTermijnResponse = DecosZakenResponse<DecosTermijnSource[]>;
export type DecosLinkedFieldResponse = DecosZakenResponse<
  DecosContent<object>[]
>;

export type DecosResponse<T> = {
  itemDataResultSet: {
    content: T[];
  };
};
export type DecosWorkflowStepTitle = string;
export type DecosWorkflowStepDate = string;
export type DecosTermijnType = string;
export type DecosTermijnDate = string;
export type DecosZaakDocument = GenericDocument & { key: string };
export type DecosZaakID = string;
export type DecosFieldNameSource = string;
export type DecosFieldValue =
  | string
  | number
  | boolean
  | { [key: string]: DecosFieldValue }[]
  | null;

export type DecosZaakFieldsSource = {
  // status
  title: string;
  // caseType
  text45: string;
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
type DecosWorkflowFieldsSource = {
  text7: string;
  date1?: string;
};
type DecosTermijnFieldsSource = {
  subject1: string; // Type termijn
  subject2?: string; // Description
  date4: string; // dateStart
  date5: string; // dateEnd
  num1?: number; // number of days
};
export type AddressBookEntry = {
  key: string;
};
export const adresBoekenBSN =
  process.env.BFF_DECOS_API_ADRES_BOEKEN_BSN?.split(',') ?? [];

export const adresBoekenKVK =
  process.env.BFF_DECOS_API_ADRES_BOEKEN_KVK?.split(',') ?? [];

export const adresBoekenByProfileType: Record<ProfileType, string[]> = {
  private: adresBoekenBSN,
  commercial: adresBoekenKVK,
  'private-attributes': [],
};

export const MA_DECISION_DEFAULT = 'Zie besluit';

export type ZakenFilter = (zaak: DecosZaakBase) => boolean;

export type DecosFieldTransformer<T extends DecosZaakBase = DecosZaakBase> = {
  name: keyof T;
  transform?: (input: any) => DecosFieldValue;
};

type CaseTypeLiteral<T extends DecosZaakBase> = unknown extends T['caseType']
  ? DecosZaakBase extends T // Allow unextended baseCase for easier internal function typing
    ? unknown
    : never
  : T['caseType'];
export type DecosZaakTransformer<T extends DecosZaakBase = DecosZaakBase> = {
  // The caseType (zaaktype) of the sourceData.
  caseType: CaseTypeLiteral<T>;
  // Title of the DecosZaakBase, mostly a slightly different variant of the $caseType
  title: T['title'];
  // A mapping object that can be used to assign a readable attribute to the data sent to the frontend.
  // For example: date6 becomes dateStart. Additionally a function can be provided to perform some compute on the value assigned to the sourceField.
  // For example String operations like, trim, split, uppercase etc.
  transformFields: Partial<DecosFieldTransformerObject<T>>;
  // After transform is used to perform additional transformations after the initial transform.
  // Business logic is implemented at this point, also async calls to other services to enrich the data can be done here.
  afterTransform?: (
    decosZaak: T,
    decosZaakSource: DecosZaakSource
  ) => Promise<T>;
  // A function to check if the source data quality and/or prerequisites for showing the data to the user are valid.
  // This function is run before transformation of the zaak.
  hasValidSourceData?: (decosZaakSource: DecosZaakSource) => boolean;
  // Indicate if the zaak requires payment to be processed and complete. This function is run before transformation of the zaak.
  requirePayment?: boolean;
  // Expands the selection of fields, based on the link address, with linked items as objects or array of objects
  fetchLinkedItem?: string[];
  // The titles of the workflow steps that are used to find a corresponding date like the InBehandeling status.
  fetchWorkflowStatusDatesFor?: { status: ZaakStatus; stepTitle: string }[];
  // The titles of the workflow steps that are used to find a corresponding date like the InBehandeling status.
  fetchTermijnenFor?: {
    status: ZaakStatus;
    type: DecosTermijnType;
  }[];
  // Indicates if the Zaak should be shown to the user / is expected to be transformed.
  isActive: boolean;
  // Notifications for this specific
  notificationLabels?: Partial<NotificationLabelByType>;
};
export type MADecision = string;
export type DecosDecision = string;
export type ZakenFilter = (zaak: DecosZaakBase) => boolean;
export type DecosZakenSourceFilter = (
  decosZaakSource: DecosZaakSource
) => boolean;

export type DecosZaakBase = {
  caseType: string;
  dateDecision: string | null;
  dateRequest: string;

  // DateStart and DateEnd are not applicable to every single decosZaak but general enough to but in base Type.
  dateStart: string | null;
  dateEnd: string | null;

  decision: string | null;

  // Url to fetch vergunnungen for a specific Zaak.
  fetchDocumentsUrl: string;

  identifier: ZaakKenmerk;
  title: string;
  id: string;

  // Decos key (uuid) used as primary id's in api communication.
  key: string;

  processed: boolean;
  status: ZaakStatus;

  // WorkflowStep statusses
  statusDates: ZaakStatusDate[];
  termijnDates: ZaakTermijnDate[];
};

export type ZaakKenmerk = `Z/${number}/${number}`; // Z/23/2230346

export type ZaakStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Afgehandeld'
  | SomeOtherString;

export type ZaakStatusDate = {
  status: ZaakStatus;
  datePublished: string | null;
};

export type ZaakTermijnDate = {
  status: ZaakStatus;
  dateStart: string;
  dateEnd: string;
};

export type WithLocation = {
  location: string | null;
};

export type WithKentekens = {
  kentekens: string | null;
};

export type WithDateStart = {
  dateStart: string | null;
};

export type WithDateEnd = {
  dateEnd: string | null;
};

export type WithDateRange = WithDateStart & WithDateEnd;

export type WithTimeRange = {
  timeStart: string | null;
  timeEnd: string | null;
};
export type WithDateTimeRange = WithDateRange & WithTimeRange; // A list of common readable api attributes

const status = 'status';
export const caseType = 'caseType';
export const identifier = 'identifier';
const processed = 'processed';
const dateDecision = 'dateDecision';
export const dateRequest = 'dateRequest';
export const dateStart = 'dateStart';
export const dateEnd = 'dateEnd';
export const location = 'location';
export const timeStart = 'timeStart';
export const timeEnd = 'timeEnd';
export const destination = 'destination';
export const description = 'description';
export const decision = 'decision';
// Fields are selected per case initially but don't end up in the data we send to front end.
// These fields are fore example used to determine payment status.

export const SELECT_FIELDS_META = ['text11', 'text12', 'subject1'];
// The set of field transforms that applies to every case.
// { $api_attribute_name_source: $api_attribute_name_mijn_amsterdam }

export const SELECT_FIELDS_TRANSFORM_BASE: DecosFieldTransformerObject = {
  title: status,
  text45: caseType,
  dfunction: decision,
  mark: identifier,
  processed: processed,
  date5: dateDecision,
  document_date: dateRequest,
  date6: dateStart,
  date7: dateEnd,
};
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

export type DecosZaakFrontend<T extends DecosZaakBase = DecosZaakBase> = T & {
  dateDecisionFormatted?: string | null;
  dateInBehandeling: string | null;
  dateInBehandelingFormatted: string | null;
  dateRequestFormatted: string;
  dateStartFormatted?: string | null;
  dateEndFormatted?: string | null;
  isExpired?: boolean;
  displayStatus: string;
  // Url to fetch documents for a specific Zaak.
  fetchDocumentsUrl: string;
} & ZaakDetail<T['status']>;
