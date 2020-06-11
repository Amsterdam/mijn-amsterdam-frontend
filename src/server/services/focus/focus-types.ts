export interface Step {
  document: FocusDocument[];
  datum: string;
  // status: RequestStatus;
  aantalDagenHerstelTermijn?: string;
  reden?: string;
}

// Shape of the data returned from the Api
export interface FocusProduct {
  _id: string;
  soortProduct: ProductOrigin;
  typeBesluit: Decision;
  naam: string;
  processtappen: {
    aanvraag: Step | null;
    inBehandeling: Step;
    herstelTermijn: Step;
    beslissing: Step;
    bezwaar: Step;
  };
  dienstverleningstermijn: number;
  inspanningsperiode: number;
  datePublished: string;
}

// The process steps are in order of:
export type StepTitle =
  | 'aanvraag'
  | 'inBehandeling'
  | 'herstelTermijn'
  | 'beslissing'
  | 'bezwaar';

export type RequestStatus =
  | 'Aanvraag'
  | 'Meer informatie nodig'
  | 'In behandeling'
  | 'Besluit'
  | 'Bezwaar';

// A decision can be made and currently have 3 values.
export type Decision = 'Toekenning' | 'Afwijzing' | 'Buiten Behandeling';
export type DecisionFormatted =
  | 'toekenning'
  | 'afwijzing'
  | 'buitenbehandeling';

// The official terms of the Focus api "product categories" data how they are used within the Municipality of Amsterdam.
export type ProductOrigin =
  | 'Participatiewet'
  | 'Bijzondere Bijstand'
  | 'Minimafonds';

// The official terms of the Focus api "product" names how they are used within the Municipality of Amsterdam.
export type ProductTitle = 'Levensonderhoud' | 'Stadspas' | string;

export type TextPartContent = string;
export type TextPartContentFormatter = (data: any) => TextPartContent;
export type TextPartContents = TextPartContent | TextPartContentFormatter;

export interface Info {
  title: TextPartContents;
  description: TextPartContents;
  status: RequestStatus;
  notification: {
    title: TextPartContents;
    description: TextPartContents;
  };
}

export type InfoExtended = { [decision: string]: Info };

export interface ProductType {
  aanvraag: Info | null;
  inBehandeling: Info | null;
  herstelTermijn: Info | null;
  bezwaar: Info | null;
  beslissing: InfoExtended | null;
}

export type LabelData = {
  [origin in ProductOrigin]: { [productTitle in ProductTitle]: ProductType };
};

export type RoutesByProductOrigin = {
  [origin in ProductOrigin]: { [productTitle in ProductTitle]: string };
};

export interface FocusDocument {
  $ref: string;
  id: number;
  isBulk: boolean;
  isDms: boolean;
  omschrijving: string;
}
