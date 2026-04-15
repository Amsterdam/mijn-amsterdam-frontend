export type SalesforceResponseType = {
  '@onformdata.context': string;
};

export type ContactType =
  | 'Telefoon'
  | 'Chat'
  | 'Contactformulier'
  | 'Stadsloket';

export type KlantcontactSource = {
  plaatsgevondenOp: string;
  onderwerp: string;
  nummer: string;
  kanaal: string;
};

export type KlantcontactResponseSource = {
  results: KlantcontactSource[];
};

export type KlantcontactFrontend = {
  datePublished: string;
  datePublishedFormatted: string;
  subject: string;
  referenceNumber: string;
  contacttype: ContactType;
};

type Product = {
  name: string;
};

type Status = 'No show' | 'Canceled';

export type AppointmentSource = {
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

export type AppointmentResponseSource = {
  results: AppointmentSource[];
  previous: string | null;
  next: string | null;
  count: number;
};

export type AppointmentFrontend = {
  appointmentDate: string;
  appointmentDateFormatted: string;
  startTime: string;
  endTime: string;
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

export type ContactmonentResponseData = {
  klantcontacten: KlantcontactFrontend[];
  appointments: AppointmentFrontend[];
};
