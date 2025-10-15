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

export type AfisFacturenByStateResponse = {
  [key in AfisFactuurState]?: AfisFacturenResponse | null;
};

export type AfisThemaResponse = {
  isKnown: boolean;
  businessPartnerIdEncrypted: string | null;
  businessPartnerId?: string | null;
  facturen: AfisFacturenByStateResponse | null;
};

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

export type AfisFactuurState = 'open' | 'afgehandeld' | 'overgedragen';

export type AfisFacturenResponse = {
  count: number;
  facturen: AfisFactuur[];
  state: AfisFactuurState;
};

export type AfisFacturenParams = {
  state: AfisFactuurState | 'deelbetalingen';
  businessPartnerID: string;
  top?: string;
};

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

export type AfisInvoicesSource =
  AfisApiFeedResponseSource<AfisFactuurPropertiesSource>;

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

export type AccountingDocumentType = string;


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

export type AfisEMandateSource = {
  ABC: string;
};

export type AfisEMandatesResponseDataSource =
  AfisApiFeedResponseSource<AfisEMandateSource>;

// Static fixed values, loaded from ENV
export type AfisEMandatePayloadBase = {
  PayType: string;
  SndType: string;
  RefType: string;
  RecType: string;
  RecId: string;
  Status: string;
};

export type AfisEMandatePayloadCreate = AfisEMandatePayloadBase & {
  // Sender
  SndId: AfisBusinessPartnerDetailsTransformed['businessPartnerId']; // Business partner ID
  SndPostal: string;
  SndCountry: string; // Country code
  SndIban: string;
  SndBic: string;
  SndStreet: string;
  SndHouse: string; // House number
  SndCity: string;
  SndName2: string; // Lastname
  SndName1: string; // Firstname
  SndDebtorId: string; // Mandaat type e.g Parkin Permit ?!?!?!?!

  // Recipient
  RecName1: 'Name1';
  RecPostal: '533';
  RecStreet: 'Ran';
  RecHouse: 'Sur';
  RecCity: 'Kk';
  RecCountry: 'NL';

  // Mandate
  LifetimeFrom: string;
  LifetimeTo: '9999-12-31T00:00:00'; // Far in the future, Gem. Amsterdam only uses indefinite mandates.
  SignDate: string;
  SignCity: string;

  // ID of the mandate in AFIS
  IMandateId: string;
};

export type AfisEMandatePayloadUpdate = AfisEMandatePayloadCreate;

export type AfisEMandate = {
  name: string;
  iban: string;
  subId: string;
  IMandateId: string;
  dateValidFrom: string;
  dateValidFromFormatted: string;
};

export type AfisEMandateAcceptant = Pick<
  AfisEMandate,
  'name' | 'iban' | 'subId'
>;

type EMandateSubId = AfisEMandate['subId'];
export type EMandateTransactionKey =
  `${EMandateSubId}-${AfisBusinessPartnerDetailsTransformed['businessPartnerId']}`;

export type AfisEMandateSignRequestResponse = {
  redirectUrl: string;
};

export type XmlNullable<T extends Record<string, unknown>> = {
  [key in keyof T]: { '@null': true } | T[key];
};
