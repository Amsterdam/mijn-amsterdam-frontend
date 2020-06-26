import { GenericDocument, LinkProps } from '../../../universal/types/App.types';
// The process steps are in order of:
export type StepTitle =
  | 'aanvraag'
  | 'inBehandeling'
  | 'herstelTermijn'
  | 'beslissing'
  | 'bezwaar';

// The official terms of the Focus api "product" names how they are used within the Municipality of Amsterdam.
export type ProductTitle = 'Levensonderhoud' | 'Stadspas' | string;

// A decision can be made and currently have 3 values.
export type Decision = 'Toekenning' | 'Afwijzing' | 'Buiten Behandeling';

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
  decision?: DecisionFormatted;
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
  decision?: DecisionFormatted;
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
  | 'buitenbehandeling';

export type TextPartContents = (data: FocusProduct, customData?: any) => string;
export type LinkContents = (
  data: FocusProduct | FocusItem,
  customData?: any
) => Partial<LinkProps>;

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
  beslissing?: FocusStepContentDecision;
  link?: LinkContents;
}

export interface LabelData {
  [ProductType: string]: {
    [productTitle: string]: ProductStepLabels;
  };
}

export type DocumentTitles = Record<string, string>;
