import { SomeOtherString } from '../../../universal/helpers/types';
import { OmitMapped } from '../../../universal/helpers/utils';
import {
  GenericDocument,
  ZaakDetail,
} from '../../../universal/types/App.types';

type DecosDocumentBase = {
  text39: string;
  text40: string;
  text41?: string;
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
export type DecosWorkflowDateByStepTitle = {
  [key: DecosWorkflowStepTitle]: DecosWorkflowStepDate | null;
};
export type AddressBookEntry = {
  key: string;
};

export type DecosFieldTransformer<T extends DecosZaakBase> = {
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
  additionalSelectFields?: string[];
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
  // A functio to determine if the zaak is verleend or not.
  // This function is run after transformation of the zaak.
  isVerleend?: (
    decosZaak: T,
    decosZaakSource: DecosZaakSource
  ) => boolean | boolean;
  // Expands the selection of fields, based on the link address, with linked items as objects or array of objects
  fetchLinkedItem?: string[];
  // The titles of the workflow steps that are used to find a corresponding date like the InBehandeling status.
  fetchWorkflowStatusDatesFor?: {
    status: ZaakStatus;
    decosActionCode: string;
  }[];
  // The titles of the workflow steps that are used to find a corresponding date like the InBehandeling status.
  fetchTermijnenFor?: {
    status: ZaakStatus;
    type: DecosTermijnType;
  }[];
  // Indicates if the Zaak should be shown to the user / is expected to be transformed.
  isActive: boolean;
};

export type ZakenFilter = (zaak: DecosZaakBase) => boolean;

export type DecosZaakBase = {
  caseType: string;
  dateDecision: string | null;
  dateRequest: string;

  // DateStart and DateEnd are not applicable to every single decosZaak but general enough to but in base Type.
  dateStart: string | null;
  dateEnd: string | null;

  decision: string | null;
  isVerleend: boolean;

  identifier: ZaakKenmerk;
  id: ZaakKenmerkSlug | SomeOtherString;
  title: string;

  // Decos key (uuid) used as primary id's in api communication.
  key: string;
  processed: boolean;

  // WorkflowStep statusses
  statusDates: ZaakStatusDate[];
  termijnDates: ZaakTermijnDate[];
};

export type ZaakKenmerk = `Z/${number}/${number}`; // Z/23/2230346
export type ZaakKenmerkSlug = `Z-${number}-${number}`; // Z-23-2230346

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
  dateStartFormatted: string | null;
};

export type WithDateEnd = {
  dateEnd: string | null;
  dateEndFormatted: string | null;
};

export type WithDateRange = WithDateStart & WithDateEnd;

export type WithTimeRange = {
  timeStart: string | null;
  timeEnd: string | null;
};
export type WithDateTimeRange = WithDateRange & WithTimeRange; // A list of common readable api attributes

export type DecosZaakFrontend<T extends DecosZaakBase = DecosZaakBase> =
  OmitMapped<T, 'statusDates' | 'termijnDates'> & {
    dateRequestFormatted: string;
    dateDecisionFormatted?: string | null;
    isExpired?: boolean;
    // Url to fetch documents for a specific Zaak.
    fetchDocumentsUrl?: string;
  } & ZaakDetail;
