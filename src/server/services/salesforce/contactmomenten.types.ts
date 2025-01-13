export type SalesforceResponseType = {
  '@onformdata.context': string;
};

export type ContactMomentSource = {
  plaatsgevondenOp: string;
  onderwerp: string;
  nummer: string;
  kanaal: string;
};

export type ContactMomentenResponseSource = {
  results: ContactMomentSource[];
};

export type ContactMoment = {
  datePublished: string;
  datePublishedFormatted: string;
  subject: string;
  referenceNumber: string;
  themaKanaal: string;
};
