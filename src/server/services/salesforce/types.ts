export type SalesforceResponseType = {
  '@onformdata.context': string;
};

export interface ContactMoment {
  plaatsgevondenOp: string;
  onderwerp: string;
  nummer: string;
  kanaal: string;
}

export interface ContactMomentenResponse {
  results: ContactMoment[];
}
