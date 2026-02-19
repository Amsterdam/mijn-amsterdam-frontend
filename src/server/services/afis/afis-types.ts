import Decimal from 'decimal.js';
import type { SetNonNullableDeep, Stringified } from 'type-fest';

import { LinkProps } from '../../../universal/types/App.types';

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
  Zakenpartnernummer: string;
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
  Zakenpartnernummer: string;
  Vestigingsnummer?: string;
  Blokkade: JaOfNee;
  Gevonden: JaOfNee;
};

export type BusinessPartnerId =
  | AfisBusinessPartnerPrivateResponseSource['Zakenpartnernummer']
  | AfisBusinessPartnerRecordCommercial['Zakenpartnernummer'];

export type AfisBusinessPartnerCommercialResponseSource = {
  Record:
    | AfisBusinessPartnerRecordCommercial
    | AfisBusinessPartnerRecordCommercial[];
};

export type AfisFacturenOverviewResponse = {
  [key in AfisFactuurStateFrontend]: AfisFacturenResponse | null;
};

export type AfisThemaResponse = {
  isKnown: boolean;
  businessPartnerIdEncrypted: string | null;
  businessPartnerId?: string | null;
  facturen: AfisFacturenOverviewResponse | null;
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
  FirstName: string;
  LastName: string;
};

export type AfisBusinessPartnerPhoneSource = {
  InternationalPhoneNumber: string;
};

export type AfisBusinessPartnerEmailSource = {
  EmailAddress: string;
};

export type AfisBusinessPartnerDetails = {
  fullName: string;
  firstName: string;
  lastName: string;
};

export type AfisBusinessPartnerAddress = {
  id: string;
  fullAddress: string;
  address: AfisBusinessPartnerAddressSource | null;
};

export type AfisBusinessPartnerPhone = {
  phone: string | null;
};

export type AfisBusinessPartnerEmail = {
  email: string | null;
};

export type AfisBusinessPartnerDetailsTransformed = {
  businessPartnerId: BusinessPartnerId;
  email?: AfisBusinessPartnerEmail['email'];
  fullName?: AfisBusinessPartnerDetails['fullName'];
  firstName?: AfisBusinessPartnerDetails['firstName'];
  lastName?: AfisBusinessPartnerDetails['lastName'];
  phone?: AfisBusinessPartnerPhone['phone'];
  fullAddress?: AfisBusinessPartnerAddress['fullAddress'];
  address?: AfisBusinessPartnerAddress['address'];
};

export type AfisBusinessPartnerBankAccount = {
  BusinessPartner: BusinessPartnerId;
  BankName: string;
  BankNumber: string;
  SWIFTCode: string;
  BankAccountHolderName: string;
  IBAN: string;
  BankAccount: string;
  BankCountryKey: string;
  CollectionAuthInd: boolean;
  BankAccountReferenceText: string;
};

export type AfisBusinessPartnerBankPayload = {
  businessPartnerId: BusinessPartnerId;
  iban: string;
  bic: string;
  swiftCode: string;
  senderName: string;
  creditorName?: string;
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
  AccountingDocumentCreationDate: string;
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
  PaymentTerms: string;
};

export type AfisFactuurState =
  | 'open'
  | 'afgehandeld'
  | 'overgedragen'
  | 'deelbetalingen'
  | 'termijnen';

export type AfisFactuurStateFrontend = Exclude<
  AfisFactuurState,
  'termijnen' | 'deelbetalingen'
>;

export type AfisFacturenResponse = {
  count: number;
  facturen: AfisFactuur[];
  state: AfisFactuurState;
};

export type AfisFacturenParams = {
  state: AfisFactuurState;
  businessPartnerID: string;
  top?: string;
  dateFrom?: string;
  dateTo?: string;
  includeAccountingDocumentIds?: string[];
  excludeAccountingDocumentIds?: string[];
};

export type AfisFactuurTermijn = {
  paymentDueDate: string;
  paymentDueDateFormatted: string;
  paymentStatus: string;
  debtClearingDate: string | null;
  debtClearingDateFormatted: string | null;
  amountOriginal: string;
  amountOriginalFormatted: string;
  term: string;
  statusDescription: string;
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
  termijnen?: AfisFactuurTermijn[];
  paylink: string | null;
  documentDownloadLink: string | null;
  statusDescription: string;
  link: LinkProps;
};

export type AfisFactuurStatus =
  | 'openstaand'
  | 'automatische-incasso'
  | 'automatische-incasso-termijnen'
  | 'in-dispuut'
  | 'gedeeltelijke-betaling'
  | 'handmatig-betalen'
  | 'overgedragen-aan-belastingen'
  | 'geld-terug'
  | 'betaald'
  | 'geannuleerd'
  | 'herinnering'
  | 'onbekend';

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
  // Sender/Debtor (The one who signs the e-mandate)
  SndId: BusinessPartnerId;
  SndPostal: string;
  SndCountry: string; // Country code
  SndIban: string;
  SndBic: string;
  SndStreet: string;
  SndHouse: string; // House number
  SndCity: string;
  SndName1: string; // Firstname
  SndName2: string; // Lastname

  // This parameter seems to be named ambiguously. It's supposed to be a Creditor reference ID (RefId)
  // see also: ./afis-e-mandates-config.ts - EMandateCreditorsGemeenteAmsterdam
  SndDebtorId: string;
};

export type EMandateReceiverSource = {
  // Receiver/Creditor/Incassant (The one who uses the e-mandate to collect payments)
  RecName1: string;
  RecPostal: string;
  RecStreet: string;
  RecHouse: string;
  RecCity: string;
  RecCountry: string;
};

export type AfisEMandateSource = AfisEMandateSourceStatic &
  EMandateReceiverSource &
  EMandateSenderSource & {
    // ID of the mandate in AFIS
    IMandateId: number;

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
  LifetimeTo: string;
};

export type AfisEMandateUpdatePayload = Partial<
  Stringified<AfisEMandateSource>
>;

export type AfisEMandateStatusCodes = {
  '0': 'NietActief';
  '1': 'Actief';
  '2': 'Te bevestigen';
  '3': 'Geblokkeerd';
  '4': 'Gestorneerd';
  '5': 'Verouderd';
  '6': 'Afgesloten';
};

export type EmandateStatusCode = Prettify<keyof AfisEMandateStatusCodes>;

export type AfisEMandateFrontend = {
  id: string;
  eMandateIdSource: AfisEMandateSource['IMandateId'] | null;
  creditorName: string;
  creditorIBAN: string;
  creditorDescription?: string;
  status: EmandateStatusCode;
  displayStatus: string;

  // Sender properties
  senderIBAN: string | null;
  senderName: string | null;

  // Properties from existing Afis mandates
  dateValidFrom: string | null;
  dateValidFromFormatted: string | null;
  dateValidTo: string | null;
  dateValidToFormatted: string | null;

  // Urls to interact with the mandate state
  deactivateUrl?: string;
  signRequestUrl?: string;
  lifetimeUpdateUrl?: string;
  signRequestStatusUrl?: string;

  link: LinkProps;
};

export type AfisEMandateCreditor = {
  iban: string;
  name: string;
  subId: string;
  refId: string;
  description?: string;
};

// Notification from POM
export type POMEMandateSignRequestPayload = {
  id_client: number;
  debtornumber: number;
  cid: number;
  mpid: number;
  payment_reference: number;
  id_request_client: string;
  event_type: string;
  amount_total: number;
  id_bank: string;
  iban: string;
  bic: string;
  account_owner: string;
  event_date: string;
  event_time: string;

  variable1: string; // Optional, used for creditor (Gemeente Amsterdam) IBAN
};

export type POMEMandateSignRequestPayloadTransformed = {
  debtornumber: string;
  debtorIBAN: string;
  debtorBIC: string;
  creditorIBAN: string;
  debtorAccountOwner: string;
  eMandateSignDate: string;
};

export type EMandateSignRequestPayload = {
  creditorIBAN: AfisEMandateCreditor['iban'];
  businessPartnerId: BusinessPartnerId;
  eMandateSignDate: string;
};

export type EMandateSignRequestNotificationPayload = {
  senderIBAN: string;
  senderBIC: string;
  senderName: string;
};

export type BusinessPartnerIdPayload = {
  businessPartnerId: BusinessPartnerId;
};

export type EMandateSignRequestStatusPayload = { paylinkId: string };

export type EMandateUpdatePayload = {
  IMandateId: AfisEMandateUpdatePayload['IMandateId'];
};

export type EMandateLifetimeChangePayload = EMandateUpdatePayload & {
  LifetimeTo: AfisEMandateSource['LifetimeTo'];
  LifetimeFrom?: AfisEMandateSource['LifetimeFrom'];
};

export type AfisEMandateSignRequestResponse = {
  redirectUrl: string;
  statusCheckPayload: string; // Encrypted payload to check the status of the sign request
};

export type AfisEMandateStatusChangeResponse = {
  status: AfisEMandateFrontend['status'];
};

export type AfisEMandateUpdatePayloadFrontend = SetNonNullableDeep<
  Pick<AfisEMandateFrontend, 'dateValidTo'>,
  'dateValidTo'
>;

export type POMSignRequestStatus =
  | 'no_response' // No reaction to the message
  | 'visited_website' // Customer has clicked on the link
  | 'payment_started' // Payment started, but not yet finished
  | 'payment_canceled' // Payment cancelled by the customer
  | 'payment_failed' // Payment failed. E.g. insufficient funds
  | 'payment_invalid' // Payment started, but status not yet known
  | 'payment_expired' // Payment started, but not completed on time
  | 'paid' // Full amount has been paid
  | 'chargeback'; // Payment was reversed by customer

export type POMSignRequestUrlResponseSource = {
  paylink: string;
  paylinkId: string;
};
export type POMSignRequestStatusResponseSource = {
  paylink_id: number;
  status: POMSignRequestStatus;
  status_date: string; // e.g 2015-03-01T12:23:44
};
export type POMSignRequestUrlPayload = {
  first_name?: string;
  last_name: string;
  debtor_number: string;
  payment_reference: string;
  concerning: string;
  batch_name: string;
  request_id?: string;
  company_name?: string;
  variable1: string;
  due_date: string;
  return_url: string;
  cid: null;
  payment_modules: ['emandate_recurring'];
  invoices?: [
    {
      invoice_number: string;
      invoice_date: string;
      invoice_description: string;
      invoice_amount: 1;
      invoice_due_date: string;
    },
  ];
};
export type AfisEMandateSignRequestStatusResponse = {
  status: POMSignRequestStatus;
};
export type AfisEMandateBankAccountExistsResponse = {
  exists: boolean;
  eMandateCollectionEnabled: boolean;
};
