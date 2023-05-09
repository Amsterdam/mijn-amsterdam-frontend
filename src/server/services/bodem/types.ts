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
  Houseletter: string;
  Postalcode: string;
  City: string;
  Workorderid: string;
  Workordercreatedon: string;
  Friendlystatus: string;
  Rejectionreason: string;
};

export type LoodMetingen = {
  metingen: LoodMeting[];
};

type LoodMeting = {
  adres;
  datumAanvraag;
  status;
  kenmerk;
};
