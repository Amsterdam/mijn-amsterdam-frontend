import { ApiResponse } from '../../../universal/helpers/api';
import { GenericDocument } from '../../../universal/types';
import { DecosCaseType } from '../../../universal/types/vergunningen';
import { NotificationLabelByType } from '../vergunningen-v2/config-and-types';

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

export type DecosFieldTransformerObject<
  T extends DecosZaakBase = DecosZaakBase,
> = Record<DecosFieldNameSource, DecosFieldTransformer<T> | keyof T>;

export type DecosZaakSource = {
  key: DecosZaakID;
  links: string[];
  fields: DecosZaakFieldsSource & DecosFieldsObject;
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
export type DecosWorkflowStepTitle = string;
export type DecosWorkflowStepDate = string;
export type DecosZaakDocument = GenericDocument & { key: string };
export type DecosZaakID = string;
export type DecosFieldNameSource = string;
export type DecosFieldValue = string | number | boolean | null;
export type DecosZaakFieldsSource = {
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
export type DecosFieldTransformer<T extends DecosZaakBase = DecosZaakBase> = {
  name: keyof T;
  transform?: (
    input: any,
    options?: DecosTransformerOptions<T>
  ) => DecosFieldValue;
};
export type DecosTransformerOptions<T extends DecosZaakBase = DecosZaakBase> = {
  decosZaakTransformer?: DecosZaakTransformer<T>;
  fetchDecosWorkflowDate?: (
    stepTitle: DecosWorkflowStepTitle
  ) => Promise<ApiResponse<string | null>>;
};

export type DecosZaakTransformer<T extends DecosZaakBase> = {
  // The caseType (zaaktype) of the sourceData.
  caseType: DecosCaseType;
  // Title of the DecosZaakBase, mostly a slightly different variant of the $caseType
  title: string;
  // A mapping object that can be used to assign a readable attribute to the data sent to the frontend.
  // For example: date6 becomes dateStart. Additionally a function can be provided to perform some compute on the value assigned to the sourceField.
  // For example String operations like, trim, split, uppercase etc.
  transformFields?: Partial<DecosFieldTransformerObject<T>>;
  // After transform is used to perform additional transformations after the initial transform.
  // Business logic is implemented at this point, also async calls to other services to enrich the data can be done here.
  afterTransform?: (
    decosZaak: T,
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
export type MADecision = string;
export type DecosDecision = string;
export type ZakenFilter = (zaak: DecosZaakBase) => boolean;
export type DecosZakenSourceFilter = (
  decosZaakSource: DecosZaakSource
) => boolean;
export interface DecosZaakBase {
  caseType: DecosCaseType;
  dateDecision: string | null;
  dateInBehandeling: string | null;
  dateRequest: string;

  // DateStart and DateEnd are not applicable to every single decosZaak but general enough to but in base Type.
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
export type ZaakKenmerk = `Z/${number}/${number}`; // Z/23/2230346
export type ZaakStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Afgehandeld'
  | string;
export interface DecosZaakWithLocation extends DecosZaakBase {
  location: string | null;
}

export interface DecosZaakWithKentekens extends DecosZaakBase {
  kentekens: string | null;
}

export interface DecosZaakWithDateRange extends DecosZaakBase {
  dateStart: string | null;
  dateEnd: string | null;
}

export interface DecosZaakWithTimeRange extends DecosZaakBase {
  timeStart: string | null;
  timeEnd: string | null;
}
export interface DecosZaakWithDateTimeRange
  extends DecosZaakWithDateRange,
    DecosZaakWithTimeRange {} // A list of common readable api attributes
const status = 'status';
export const caseType = 'caseType';
const identifier = 'identifier';
const processed = 'processed';
const dateDecision = 'dateDecision';
const dateRequest = 'dateRequest';
export const dateStart = 'dateStart';
export const dateEnd = 'dateEnd';
export const location = 'location';
export const timeStart = 'timeStart';
export const timeEnd = 'timeEnd';
export const destination = 'destination';
export const description = 'description';
// Fields are selected per case initially but don't end up in the data we send to front end.
// These fields are fore example used to determine payment status.

export const SELECT_FIELDS_META = ['text11', 'text12', 'subject1'];
// The set of field transforms that applies to every case.
// { $api_attribute_name_source: $api_attribute_name_mijn_amsterdam }

export const decision: DecosFieldTransformer = {
  name: 'decision',
  transform: (decision: string, options) => {
    const decisionTranslations =
      options?.decosZaakTransformer?.decisionTranslations;

    if (decisionTranslations) {
      const maDecision = Object.entries(decisionTranslations).find(
        ([maDecision, decosDecisions]) => {
          return decosDecisions.includes(decision);
        }
      )?.[0];
      return maDecision ?? decision;
    }
    return decision;
  },
};

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
