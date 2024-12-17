import Decimal from 'decimal.js';

import { LinkProps } from '../../../universal/types/App.types';

export type AfisApiFeedResponseSource<T> = {
  feed?: {
    count?: number;
    entry?: Array<{
      content?: {
        properties?: T;
      };
    }>;
  };
};

export type XmlNullable<T extends Record<string, unknown>> = {
  [key in keyof T]: { '@null': true } | T[key];
};

// Business partner
// ================

type JaOfNee = 'Ja' | 'Nee';

/** Business partner private response from external AFIS API.
 *
 *  # Properties
 *
 *  Record.BSN - Is a string when there is a leading zero present, otherwise a number.
 */
export type AfisBusinessPartnerPrivateResponseSource = {
  BSN: number | string;
  Gevonden: JaOfNee;
  Zakenpartnernummer?: string;
  Blokkade?: JaOfNee;
};

/** Business partner commercial response from external AFIS API.
 *
 *  # Properties
 *
 *  Record.KVK - Is a string when there is a leading zero present, otherwise a number.
 */
type AfisBusinessPartnerRecordCommercial = {
  KVK: number | string;
  Zakenpartnernummer?: string;
  Vestigingsnummer?: string;
  Blokkade: JaOfNee;
  Gevonden: JaOfNee;
};

export type AfisBusinessPartnerCommercialResponseSource = {
  Record:
    | AfisBusinessPartnerRecordCommercial
    | AfisBusinessPartnerRecordCommercial[];
};

export type AfisBusinessPartnerAddressSource = {
  AddressID: string;
  CityName: string;
  Country: string;
  HouseNumber: number;
  HouseNumberSupplementText: string;
  PostalCode: string;
  Region: string;
  StreetName: string;
  StreetPrefixName: string;
  StreetSuffixName: string;
};

export type AfisBusinessPartnerDetailsSource = {
  BusinessPartner: number;
  BusinessPartnerFullName: string;
};

export type AfisBusinessPartnerPhoneSource = {
  InternationalPhoneNumber: string;
};

export type AfisBusinessPartnerEmailSource = {
  EmailAddress: string;
};

export type AfisBusinessPartnerDetails = {
  fullName: string;
};

export type AfisBusinessPartnerAddress = {
  id: string;
  address: string;
};

export type AfisBusinessPartnerPhone = {
  phone: string | null;
};

export type AfisBusinessPartnerEmail = {
  email: string | null;
};

export type AfisBusinessPartnerDetailsTransformed = {
  businessPartnerId: string;
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
};

// Facturen
// ================

/** Extra property information
 *  ==========================
 * `ProfitCenterName`: The one requiring payment from the debtor (debiteur).
 * `AmountInBalanceTransacCrcy`: Is a decimal number and represents the amount that should be payed.
 *   When this is negative it is a 'krediet factuur' which means that money shall be returned -
 *   to the debtor.
 *  `IsCleared`: `true` means the 'factuur' is fully payed for.
 */
export type AfisFactuurPropertiesSource = {
  AccountingDocument: string;
  AmountInBalanceTransacCrcy: string;
  AccountingDocumentType: AccountingDocumentType;
  ClearingDate?: string;
  DocumentReferenceID: string;
  DunningBlockingReason: string;
  DunningLevel: number;
  IsCleared?: boolean;
  NetDueDate: string;
  InvoiceReference: string | null;
  Paylink: string | null;
  PaymentMethod: string | null;
  PostingDate: string;
  ProfitCenterName: string;
  ReverseDocument?: string;
  SEPAMandate: string;
};

export type AfisInvoicesSource =
  AfisApiFeedResponseSource<AfisFactuurPropertiesSource>;

export type AfisFactuurStatus =
  | 'openstaand'
  | 'automatische-incasso'
  | 'in-dispuut'
  | 'gedeeltelijke-betaling'
  | 'handmatig-betalen'
  | 'overgedragen-aan-belastingen'
  | 'geld-terug'
  | 'betaald'
  | 'geannuleerd'
  | 'herinnering'
  | 'onbekend';

export type AfisFactuur = {
  id: string;
  afzender: string;
  datePublished: string | null;
  datePublishedFormatted: string | null;
  paymentDueDate: string;
  paymentDueDateFormatted: string;
  debtClearingDate: string | null;
  debtClearingDateFormatted: string | null;
  amountPayed: string;
  amountPayedFormatted: string;
  amountOriginal: string;
  amountOriginalFormatted: string;
  factuurNummer: string;
  factuurDocumentId: string;
  status: AfisFactuurStatus;
  paylink: string | null;
  documentDownloadLink: string | null;
  statusDescription: string;
  link: LinkProps;
};

export type AfisInvoicesPartialPaymentsSource = AfisApiFeedResponseSource<
  Pick<
    AfisFactuurPropertiesSource,
    'AmountInBalanceTransacCrcy' | 'InvoiceReference'
  >
>;

// Facturen / Deelbetalingen
// =========================
export type AfisFactuurDeelbetalingen = {
  [factuurNummer: string]: Decimal;
};

export type AfisFactuurState = 'open' | 'afgehandeld' | 'overgedragen';

export type AfisFacturenResponse = {
  count: number;
  facturen: AfisFactuur[];
};

export type AfisFacturenByStateResponse = {
  [key in AfisFactuurState]?: AfisFacturenResponse | null;
};

export type AfisThemaResponse = {
  isKnown: boolean;
  businessPartnerIdEncrypted: string | null;
  businessPartnerId?:
    | AfisBusinessPartnerDetailsTransformed['businessPartnerId']
    | null;
  facturen?: AfisFacturenByStateResponse | null;
};

export type AfisFacturenParams = {
  state: AfisFactuurState | 'deelbetalingen';
  businessPartnerID: AfisBusinessPartnerDetailsTransformed['businessPartnerId'];
  top?: string;
};

// Documents / PDF's
// =================

export type AccountingDocumentType = string;

export type AfisArcDocID = AfisDocumentIDPropertiesSource['ArcDocId'];

export type AfisDocumentIDSource =
  AfisApiFeedResponseSource<AfisDocumentIDPropertiesSource>;

export type AfisDocumentIDPropertiesSource = {
  ArcDocId: string;
};

export type AfisDocumentDownloadSource = {
  Record: {
    attachment: string;
    attachmentname: string;
  };
};

// E-Mandates
// =================
// Static fixed values, loaded from ENV
export type AfisEMandateSourceStatic = {
  PayType: string;
  SndType: string;
  RefType: string;
  RecType: string;
  RecId: string;
  Status: string;
};

type EMandateSenderSource = {
  // Sender
  SndId: AfisBusinessPartnerDetailsTransformed['businessPartnerId'];
  SndPostal: string;
  SndCountry: string; // Country code
  SndIban: string;
  SndBic: string;
  SndStreet: string;
  SndHouse: string; // House number
  SndCity: string;
  SndName1: string; // Firstname
  SndName2: string; // Lastname
  SndDebtorId: string; // Acceptant reference ID (RefId)
};

export type AfisEMandateSource = AfisEMandateSourceStatic &
  EMandateSenderSource & {
    // ID of the mandate in AFIS
    IMandateId: string;

    // Recipient
    RecName1: string;
    RecPostal: string;
    RecStreet: string;
    RecHouse: string;
    RecCity: string;
    RecCountry: string;

    // Mandate
    LifetimeFrom: string;
    LifetimeTo: string;
    SignDate: string;
    SignCity: string;
  };

export type AfisEMandatesResponseDataSource =
  AfisApiFeedResponseSource<AfisEMandateSource>;

export type AfisEMandateCreatePayload = Omit<
  AfisEMandateSource,
  'IMandateId'
> & {
  LifetimeTo: '9999-12-31T00:00:00';
};

export type AfisEMandateUpdatePayload = Partial<AfisEMandateSource>;

export type AfisEMandateCreateParams = {
  acceptantIBAN: AfisEMandateAcceptant['iban'];
  sender: EMandateSenderSource;
  eMandateSignDate: string;
  eMandatesignCity: string;
};

export type AfisEMandateFrontend = {
  acceptant: string;
  status: string;
  displayStatus: string;

  // Sender properties
  senderIBAN: string | null;
  senderName: string | null;

  // Properties from existing Afis mandates
  dateValidFrom: string | null;
  dateValidFromFormatted: string | null;

  // Urls to interact with the mandate state
  statusChangeUrl?: string;
  signRequestUrl?: string;
};

export type AfisEMandateAcceptant = {
  iban: string;
  name: string;
  subId: string;
  refId: string;
};

export type EMandateSignRequestPayload = {
  acceptantIBAN: AfisEMandateAcceptant['iban'];
  businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId'];
};

export type BusinessPartnerIdPayload = {
  businessPartnerId: AfisBusinessPartnerDetailsTransformed['businessPartnerId'];
};

export type EMandateSignRequestStatusPayload = {
  mpid: string;
};

export type EMandateStatusChangePayload = {
  Status: AfisEMandateSource['Status'];
  IMandateId: AfisEMandateSource['IMandateId'];
  LifetimeTo: AfisEMandateSource['LifetimeTo'];
  LifetimeFrom?: AfisEMandateSource['LifetimeFrom'];
};

export type AfisEMandateSignRequestResponse = {
  redirectUrl: string;
  statusCheckUrl: string;
};

// POM payment api status codes
export const signRequestStatusCodes = {
  101: 'NoResponse', // No reaction to the message
  500: 'VisitedWebsite', // Customer has clicked on the link
  700: 'PaymentStarted', // Payment started, but not yet finished
  701: 'PaymentCanceled', // Payment cancelled by the customer
  702: 'PaymentFailed', // Payment failed. E.g. insufficient funds
  703: 'PaymentInvalid', // Payment started, but status not yet known
  704: 'PaymentExpired', // Payment started, but not completed on time
  900: 'Paid', // Full amount has been paid
  998: 'Chargeback', // Payment was reversed by customer
} as const;

export type POMSignRequestStatusCode = keyof typeof signRequestStatusCodes;
export type POMSignRequestUrlResponseSource = { paylink: string; mpid: string };
export type POMSignRequestStatusResponseSource = {
  mpid: number;
  status_code: POMSignRequestStatusCode;
  status_date: string; // e.g 2015-03-01T12:23:44
};

export type AfisEMandateSignRequestStatusResponse = {
  status: string;
  code: POMSignRequestStatusCode;
};
