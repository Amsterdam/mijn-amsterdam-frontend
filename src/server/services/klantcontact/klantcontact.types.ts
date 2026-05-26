import type { LinkProps } from '../../../universal/types/App.types.ts';

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
  caseReference: string;
  subject: string;
  products: Product[];
  status: Status;
  startDate: string;
  endDate: string;
  qrCode: string;
  location: {
    street: string | null;
    postalCode: string | null;
    name: string;
    countryCode: string;
    city: string | null;
  };
  cancellationLink: string;
};

export type AfspraakResponseSource = {
  results: AfspraakSource[];
  previous: string | null;
  next: string | null;
  count: number;
};

export type AfspraakFrontend = Omit<
  AfspraakSource,
  'startDate' | 'endDate' | 'products'
> & {
  dateStart: string;
  dateStartFormatted: string;
  dateEnd: string;
  dateEndFormatted: string;
  displayDateTime: string;
  link: LinkProps;
  icsLink: LinkProps;
};

export type KlantcontactResponseData = {
  contactmomenten: ContactmomentFrontend[];
  afspraken: AfspraakFrontend[];
};
