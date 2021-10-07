import { GenericDocument, LinkProps } from '../../../universal/types/App.types';
// The process steps are in order of:
export type StepTitle =
  | 'aanvraag'
  | 'inBehandeling'
  | 'herstelTermijn'
  | 'besluit'
  | 'bezwaar'
  | string;

// The official terms of the Focus api "product" names how they are used within the Municipality of Amsterdam.
export type ProductTitle = 'Levensonderhoud' | 'Stadspas' | string;
// A decision can be made and currently have 3 values.
export type Decision =
  | 'Toekenning'
  | 'Afwijzing'
  | 'Buiten Behandeling'
  | 'Intrekking';

// The official terms of the Focus api "product categories" data how they are used within the Municipality of Amsterdam.
export type ProductType =
  | 'Tozo'
  | 'Tonk'
  | 'Bbz'
  | 'Participatiewet'
  | 'Bijzondere Bijstand'
  | 'Minimafonds'
  | string;

// Shape of the data returned from the Api
export interface FocusDocumentFromSource {
  $ref: string;
  id: number;
  isBulk: boolean;
  isDms: boolean;
  omschrijving: string;
}

export interface FocusProductStepFromSource {
  document: FocusDocumentFromSource[];
  datum: string;
  // status: RequestStatus;
  aantalDagenHerstelTermijn?: string;
  reden?: string;
}

export interface FocusProductFromSource {
  _id: string;
  soortProduct: ProductType;
  typeBesluit?: Decision;
  naam: string;
  processtappen: {
    [stepTitle in StepTitle]: FocusProductStepFromSource | null;
  };
  dienstverleningstermijn: number;
  inspanningsperiode: number;
}

// Normalized source producs
export interface FocusProductStep {
  id: string;
  title: StepTitle;
  documents: GenericDocument[];
  datePublished: string;
  aantalDagenHerstelTermijn?: number;
}

export interface FocusProduct {
  id: string;
  title: string;
  dateStart: string;
  datePublished: string;
  type: ProductType;
  decision?: DecisionFormatted | null;
  steps: FocusProductStep[];
  dienstverleningstermijn?: number;
  inspanningsperiode?: number;
  productTitle?: string;
}

export interface FocusItemStep {
  id: string;
  documents: GenericDocument[];
  title: StepTitle;
  description: string;
  datePublished: string;
  status: RequestStatus | '';
  product?: string;
  isActive?: boolean;
  isChecked?: boolean;
  decision?: DecisionFormatted | null;
  notificationTitle?: string;
  notificationDescription?: string;
  notificationLink?: LinkProps;
}

export interface FocusItem extends FocusProduct {
  status: RequestStatus;
  steps: FocusItemStep[];
  link: LinkProps;
  dateEnd: string | null;
}

export type RequestStatus =
  | 'Aanvraag'
  | 'Informatie nodig'
  | 'In behandeling'
  | 'Besluit'
  | 'Bezwaar'
  | string;

export type DecisionFormatted =
  | 'toekenning'
  | 'afwijzing'
  | 'intrekking'
  | 'buitenbehandeling';

export type TextPartContents = (data: any, customData?: any) => string;
export type LinkContents = (data: any, customData?: any) => LinkProps;

export interface FocusStepContent {
  description: TextPartContents;
  status: RequestStatus;
  notification?: {
    title: TextPartContents;
    description: TextPartContents;
    link?: LinkContents;
  };
}

export type FocusStepContentDecision = {
  [decision in DecisionFormatted]?: FocusStepContent;
};

export interface ProductStepLabels {
  aanvraag?: FocusStepContent;
  inBehandeling?: FocusStepContent;
  herstelTermijn?: FocusStepContent;
  bezwaar?: FocusStepContent;
  besluit?: FocusStepContentDecision;
  link?: LinkContents;
  [key: string]: any;
}

export interface LabelData {
  [ProductType: string]: {
    [productTitle: string]: ProductStepLabels;
  };
}

export type DocumentTitles = Record<string, string>;

export type FocusDocumentStepType = 'aanvraag' | 'herstelTermijn' | 'besluit';

export type FocusTonkStepType =
  | FocusDocumentStepType
  | 'correctiemail'
  | 'verklaring';

export type FocusBbzStepType =
  | FocusDocumentStepType
  | 'beslistermijn'
  | 'brief'
  | 'voorschot';

export type FocusTozoStepType =
  | FocusDocumentStepType
  | 'vrijeBeschikking'
  | 'voorschot'
  | 'terugvordering'
  | 'verklaring';

export interface FocusDocumentLabelSet {
  labels: FocusStepContent;
  omschrijving: string;
  documentTitle: string;
  product: string;
  productSpecific?: 'uitkering' | 'lening';
  stepType: string;
  datePublished?: string;
  decision?: DecisionFormatted;
}

export interface FocusTozoLabelSet extends FocusDocumentLabelSet {
  product: 'Tozo 1' | 'Tozo 2' | 'Tozo 3' | 'Tozo 4' | 'Tozo 5';
  stepType: FocusTozoStepType;
}

export interface FocusTonkLabelSet extends FocusDocumentLabelSet {
  product: 'TONK';
  stepType: FocusTonkStepType;
}

export interface FocusBbzLabelSet extends FocusDocumentLabelSet {
  product: 'Bbz' | 'IOAZ';
  stepType: FocusBbzStepType;
}

export type ToxxLabelSet =
  | FocusTozoLabelSet
  | FocusTonkLabelSet
  | FocusBbzLabelSet;

export type ToxxLabelSetCollection = Record<
  string,
  FocusTozoLabelSet | FocusTonkLabelSet | FocusBbzLabelSet
>;
