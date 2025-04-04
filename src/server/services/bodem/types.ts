import {
  GenericDocument,
  LinkProps,
  ZaakDetail,
} from '../../../universal/types';

export type Lood365Response = {
  '@onformdata.context': string;
  responsedata: string; // String with a encoded JSON message containing LoodMetingRequestSource object.
};

export type LoodMetingRequestsSource = {
  Requestor: {
    Initials: string;
    Firstname: string;
    Lastname: string;
    Mainphone: string | null;
    Mobilephone: string | null;
    Emailaddress: string;
  };
  Requests: LoodMetingRequestSource[];
};

type LoodMetingRequestSource = {
  Reference: string;
  RequestedOn: string;
  Researchlocations: LoodMetingResearchLocationSource[];
};

type LoodMetingResearchLocationSource = {
  Reference: string;
  Street: string;
  Housenumber: string;
  Houseletter: string | null;
  Postalcode: string;
  City: string;
  Workorderid: string | null;
  Workordercreatedon: string | null;
  Friendlystatus: LoodMetingStatus;
  Rejectionreason: string | null;
  ReviewedOn: string | null;
  Reportsenton: string | null;
  Reportavailable: boolean;
};

export type LoodMetingStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Afgewezen'
  | 'Afgehandeld';

export type LoodMetingDecision = 'Afgewezen' | 'Verleend';

export type LoodMetingen = {
  metingen: LoodMetingFrontend[];
};

export interface LoodMetingFrontend extends ZaakDetail<LoodMetingStatus> {
  adres: string;
  datumAanvraag: string; // RequestedOn
  datumAanvraagFormatted: string;
  datumInbehandeling: string | null; // Workordercreatedon
  datumAfgehandeld: string | null; // Reportsenton | ReviewedOn
  datumAfgehandeldFormatted: string | null;
  status: LoodMetingStatus;
  decision: LoodMetingDecision | null;
  processed: boolean;
  kenmerk: string;
  aanvraagNummer: string;
  rapportBeschikbaar: boolean;
  link: LinkProps;
  redenAfwijzing: string | null;
  rapportId: string | null;
  document: GenericDocument | null;
}

export type LoodMetingStatusLowerCase = Lowercase<LoodMetingStatus>;

export type LoodMetingDocument = {
  filename: string;
  mimetype: string;
  documentbody: string;
};
