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

type SourceStatus = 'Ontvangen' | 'In behandeling' | 'Afgewezen';

type LoodMetingResearchLocationSource = {
  Reference: string;
  Street: string;
  Housenumber: string;
  Houseletter: string | null;
  Postalcode: string;
  City: string;
  Workorderid: string | null;
  Workordercreatedon: string | null;
  Friendlystatus: SourceStatus;
  Rejectionreason: string | null;
  ReviewedOn: string | null;
  Reportsenton: string | null;
  Reportavailable: boolean;
};

export type LoodMetingen = {
  metingen: LoodMetingFrontend[];
};

export type LoodMetingStatus = SourceStatus | 'Afgehandeld';

export interface LoodMetingFrontend extends ZaakDetail {
  adres: string;
  datumAanvraag: string; // RequestedOn
  datumAanvraagFormatted: string;
  datumInbehandeling: string | null; // Workordercreatedon
  datumAfgehandeld: string | null; // Reportsenton
  datumBeoordeling: string | null; // ReviewedOn
  status: LoodMetingStatus;
  kenmerk: string;
  aanvraagNummer: string;
  rapportBeschikbaar: boolean;
  link: LinkProps;
  redenAfwijzing: string | null;
  rapportId: string | null;
  document: GenericDocument | null;
}

export type LoodMetingDocument = {
  filename: string;
  mimetype: string;
  documentbody: string;
};
