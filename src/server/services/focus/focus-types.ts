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
}

export interface FocusItem extends FocusProduct {
  status: RequestStatus;
  steps: FocusItemStep[];
  link: LinkProps;
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
export type LinkContents = (data: any, customData?: any) => Partial<LinkProps>;

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

export type FocusTonkStepType =
  | 'aanvraag'
  | 'herstelTermijn'
  | 'besluit'
  | 'intrekken'
  | 'verklaring';

export type FocusTonkLabelSet = {
  labels: FocusStepContent;
  omschrijving: string;
  documentTitle: string;
  product: 'TONK';
  stepType: FocusTonkStepType;
  productSpecific?: '';
};

export type FocusTozoStepType =
  | 'aanvraag'
  | 'herstelTermijn'
  | 'besluit'
  | 'intrekken'
  | 'vrijeBeschikking'
  | 'voorschot'
  | 'terugvordering'
  | 'verklaring';

export type FocusTozoLabelSet = {
  labels: FocusStepContent;
  omschrijving: string;
  documentTitle: string;
  product: 'Tozo 1' | 'Tozo 2' | 'Tozo 3' | 'Tozo 4';
  productSpecific: 'uitkering' | 'lening' | 'voorschot' | 'aanvraag' | '';
  stepType: FocusTozoStepType;
};

export type ToxxLabelSet = FocusTozoLabelSet | FocusTonkLabelSet;

export type ToxxLabelSetCollection = Record<
  string,
  FocusTozoLabelSet | FocusTonkLabelSet
>;
