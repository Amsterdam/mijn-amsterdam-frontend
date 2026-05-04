export type SalesforceResponseType = {
  '@onformdata.context': string;
};

export type Kanaal = 'Telefoon' | 'Chat' | 'Contactformulier' | 'Stadsloket';

export type ContactmomentSource = {
  plaatsgevondenOp: string;
  onderwerp: string;
  nummer: string;
  kanaal: string;
};

export type ContactmomentResponseSource = {
  results: ContactmomentSource[];
};

export type ContactmomentFrontend = {
  datePublished: string;
  datePublishedFormatted: string;
  subject: string;
  referenceNumber: string;
  kanaal: Kanaal;
};

type Product = {
  name: string;
};

type Status = 'New' | 'No show' | 'NoShowCounter' | 'Completed' | 'Cancelled';

export type AfspraakSource = {
  subject: string;
  status: Status;
  startDate: string;
  qrCode: string;
  products: Product[];
  location: {
    street: string | null;
    postalCode: string | null;
    name: string;
    countryCode: string;
    city: string | null;
  };
  endDate: string;
  caseReference: string;
  cancellationLink: string;
};

export type AfspraakResponseSource = {
  results: AfspraakSource[];
  previous: string | null;
  next: string | null;
  count: number;
};

export type AfspraakFrontend = {
  startDate: string;
  endDate: string;
  dateFormatted: string;
  subject: string;
  status: Status;
  qrCode: string;
  location: {
    street: string | null;
    postalCode: string | null;
    name: string;
    countryCode: string;
    city: string | null;
  };
  caseReference: string;
  cancellationLink: string;
};

export type KlantcontactResponseData = {
  contactmomenten: ContactmomentFrontend[];
  afspraken: AfspraakFrontend[];
};
