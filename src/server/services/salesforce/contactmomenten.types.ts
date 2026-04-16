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

type Product = {
  name: string;
};

export type AppointmentSource = {
  subject: string;
  status: string;
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

export type ContactmomentAppointment = {
  appointmentDate: string;
  appointmentDateFormatted: string;
  startTime: string;
  endTime: string;
  subject: string;
  status: string;
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

export type ContactmonentResponseData = {
  klantcontacten: ContactMoment[];
  appointments: ContactmomentAppointment[];
};
