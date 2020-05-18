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
export type productType =
  | 'Participatiewet'
  | 'Bijzondere Bijstand'
  | 'Minimafonds';

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
  soortProduct: productType;
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
  type: productType;
  decision?: DecisionFormatted;
  steps: FocusProductStep[];
  dienstverleningstermijn: number;
  inspanningsperiode: number;
}

export type RequestStatus =
  | 'Aanvraag'
  | 'Meer informatie nodig'
  | 'In behandeling'
  | 'Besluit'
  | 'Bezwaar'
  | string;

export type DecisionFormatted =
  | 'toekenning'
  | 'afwijzing'
  | 'buitenbehandeling';

export type TextPartContents = (data: FocusProduct, customData?: any) => string;

export interface FocusStepContent {
  title: TextPartContents;
  description: TextPartContents;
  status: RequestStatus;
  notification: {
    title: TextPartContents;
    description: TextPartContents;
    linkTitle?: TextPartContents;
    linkTo?: TextPartContents;
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
  link?: LinkProps;
}

export interface LabelData {
  [productType: string]: {
    [productTitle: string]: ProductStepLabels;
  };
}

export type DocumentTitles = Record<string, string>;

export interface FocusItemStep {
  id: string;
  documents: GenericDocument[];
  title: string;
  description: string;
  datePublished: string;
  status: RequestStatus | '';
  isLastActive: boolean;
  isChecked: boolean;
}

export interface FocusItem {
  id: string;
  datePublished: string;
  dateStart: string;
  title: string;
  steps: FocusItemStep[];
  link: LinkProps;
}
